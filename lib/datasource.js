const path = require('path')

const low = require('lowdb')
const hyperdrive = require('hyperdrive')
const level = require('level')
const streaminto = require('level-write-stream')
const multi = require('multi-write-stream')
const eos = require('end-of-stream')
const raf = require('random-access-file')
const fs = require('fs-extra')
const mkdirp = require('mkdirp').sync
const through = require('through2')
const parallel = require('parallel-transform')
const pump = require('pump')
const pumpify = require('pumpify')
const yuno = require('yunodb')
const sum = require('lodash/sum')
const remove = require('lodash/remove')
const assign = require('lodash/assign')
const speed = require('speedometer')()
const discover = require('hyperdiscovery')

const debug = require('debug')('sciencefair')
const debugStream = require('debug-stream')(debug)

const C = require('./constants')

function Datasource (key) {
  if (!(this instanceof Datasource)) return new Datasource(key)

  const self = this
  self.loading = true
  self.queuedDownloads = []
  console.log(self)

  self.key = key
  self.datadir = path.join(C.DATASOURCES_PATH, key)
  mkdirp(self.datadir)

  self._downloads = []

  // stats about the datasource are held in memory and persisted in JSON
  const statspath = path.join(self.datadir, 'source.stats')
  self.stats = low(statspath)
  self.stats.defaults({
    peers: 0,
    metadataSync: {
      total: 0,
      done: 0,
      finished: false
    }
  }).value()
  self.stats.read()

  // mapping of article IDs to filepaths stored in levelDB
  const filedbpath = path.join(self.datadir, 'file.map')
  self.filedb = level(filedbpath, { valueEncoding: 'json' })

  // prepare the hyperdrive
  const dbpath = path.join(self.datadir, 'hyper.drive')
  const articlesdbpath = path.join(self.datadir, 'articles.drive')
  const filepath = file => path.join(self.datadir, file)

  const hyperdb = level(dbpath)
  const articlesdb = level(articlesdbpath)
  self.drive = hyperdrive(hyperdb)
  self.articlesdrive = hyperdrive(articlesdb)

  // prepare the search index
  const dbopts = {
    location: path.join(self.datadir, 'yuno.db'),
    keyField: '$.id',
    indexMap: {
      'title': true,
      'author': true,
      'date': false,
      'identifier': false,
      'abstract': true,
      'path': false,
      'entryfile': false
    }
  }

  self.connectdb = cb => {
    yuno(dbopts, (err, db) => {
      if (err) return cb(err)
      self.db = db
      self.loading = false
      return cb(null, db)
    })
  }

  // connect to the hyperdrive swarm and activate the DB
  self.connect = cb => {
    if (self.connected) return cb()
    console.log('connecting meta', self.key)

    // callback after an error, or when both database and hyperdrive
    // (_feed.json) are connected
    const done = require('../lib/alldone')(2, err => {
      if (err) return cb(err)
      console.log(`source ${self.name || self.key}: database and hyperdrive connected`)
      self.maybeSyncMetadata()
      cb()
    })

    self.connectdb(done)

    self.archive = self.drive.createArchive(
      new Buffer(self.key, 'hex'),
      {
        live: false,
        sparse: true,
        file: name => raf(filepath(name))
      }
    )

    self.archive.on('download', data => speed(data.length))

    const swarm = discover(self.archive)

    swarm.on('connection', (peer, type) => {
      console.log(`Connected to meta peer (${type.type} port ${type.port})`)
      self.stats.set('peers', swarm.connections.length).value()
      peer.on('close', () => {
        console.log(`Disconnected from meta peer (${type.type} port ${type.port})`)
        self.stats.set('peers', swarm.connections.length).value()
      })
    })

    const loadjson = err => {
      if (err) return done(err)

      fs.readJson(filepath('_feed.json'), (err, obj) => {
        if (err) return done(err)

        Object.assign(self, obj)
        process.nextTick(self.syncArticleMetadata)
        return done()
      })
    }

    const countArticles = () => {
      let articleCount = self.stats.get('articleCount').value() || 0
      self.archive.list({ live: false }).on('data', entry => {
        if (entry.name === '_feed.json') {
          fetchjson(entry)
        } else if (/^meta.*json$/.test(entry.name)) {
          articleCount++
        }
      }).on(
        'error', err => done(err)
      ).on(
        'close', () => self.stats.set('articleCount', articleCount).value()
      ).on(
        'end', () => self.stats.set('articleCount', articleCount).value()
      )
    }

    const fetchjson = entry => {
      if (!self.archive.isEntryDownloaded(entry)) {
        self.archive.download(entry, loadjson)
      } else {
        loadjson()
      }
    }

    try {
      loadjson()
      if (!(self.stats.get('articleCount').value())) countArticles()
    } catch (e) {
      console.log('Could not load feed metadata JSON, syncing...', e)
      self.archive.list({ live: false }).on('data', entry => {
        if (entry.name === '_feed.json') {
          fetchjson(entry)
          if (!(self.stats.get('articleCount').value())) countArticles()
        }
      })
    }
  }

  self.maybeSyncMetadata = () => {
    if (self.stats.get('active').value()
        && !(self.stats.get('metadataSync.finished').value())) {
      console.log('Resuming metadata sync')
      self.syncMetadata(
        err => {
          if (err) return console.log('error resuming datasource sync:', err)
        }
      )
    }
  }

  // load a bibjson metadata entry
  self.loadEntry = entry => fs.readJsonSync(path.join(self.datadir, entry.name))

  // streaming check if the entry is a metadata file, and if so
  // that it has been downloaded
  self.ensureMetaFile = function () {
    return parallel(128, (entry, next) => {
      if (/^meta.*json$/.test(entry.name)) {
        if (self.archive.isEntryDownloaded(entry)) {
          next(null, self.loadEntry(entry))
        } else {
          self.archive.download(entry, err => {
            if (err) return next(err)
            next(null, self.loadEntry(entry))
          })
        }
      } else {
        next()
      }
    })
  }

  // begin or resume syncing metadata from the hyperdrive archive
  // and adding it to the search index
  self.syncMetadata = cb => {
    if (self.stats.get('metadataSync.finished').value()) return cb()

    var end
    var metadataPos = self.stats.get('metadataSync.done').value() || 0

    const count = through.ctor({ objectMode: true }, (data, enc, next) => {
      metadataPos += 1
      if (metadataPos % 100 === 0) {
        self.stats.get('metadataSync').assign({
          done: metadataPos,
          finished: false
        }).value()
      }
      next(null, data)
    })

    const topaper = through.ctor({ objectMode: true }, (data, enc, next) => {
      data.source = self.key
      const meta = require('./getpaper')(data, true).metadata()
      next(null, meta)
    })

    const list = self.archive.list({
      live: false,
      offset: metadataPos
    })

    list.once('data', () => {
      self.stats.get('metadataSync').assign({
        total: self.archive.metadata.blocks
      }).value()
    })

    const done = err => {
      if (err) {
        self.stats.get('metadataSync').assign({
          done: metadataPos,
          finished: false
        }).value()
        return cb(err)
      }

      self.stats.get('metadataSync').assign({
        done: metadataPos,
        finished: true
      }).value()
      self.connected = true
      cb()
    }

    pumpify.obj(
      list,
      count(),
      self.ensureMetaFile(),
      topaper(),
      self.db.add(done)
    )
  }

  self.articleMetadataSynced = () => self.stats.get('articleMetadataSynced').value()

  self.syncArticleMetadata = () => {
    self.connectArticles()
    if (self.articleMetadataSynced()) {
      console.log('article metadata already synced')
      return
    }

    var rs = self.articles.list({
      live: false
    })

    var fileEntries = 0
    self.filedb.createReadStream().on('data', () => {
      fileEntries++
    }).on('end', () => {
      console.log('local DB contains', fileEntries, 'entries')
      console.log('streaming article metadata to local DB now')

      rs.once('data', function () {
        const blocks = self.articles.metadata.blocks
        console.log('articles feed contains %d entries\n', blocks)

        // TODO: resume from offset
        if (blocks - 2 === fileEntries) {
          console.log('all file entries synced to local DB')
        } else {
          console.log('syncing file entries to local DB')

          rs.on('data', function (data) {
            self.filedb.put(data.name, data, () => {})
          })

          rs.on('end', () => {
            console.log('synced file metadata of all articles')
            self.stats.set('articleMetadataSynced', true).value()
            self.articles.close(err => {
              if (err) return console.error('error closing articles archive', err)
            })
          })
        }
      })
    })
  }

  self.connectArticles = () => {
    console.log('connecting articles', self.articleFeed)
    self.articles = self.articlesdrive.createArchive(
      new Buffer(self.articleFeed, 'hex'),
      {
        live: false,
        sparse: true,
        file: name => raf(filepath(name))
      }
    )
    const swarm = discover(self.articles)

    swarm.on('connection', (peer, type) => {
      console.log(`Connected to articles peer (${type.type} port ${type.port})`)
      self.stats.set('articlepeers', swarm.connections.length).value()
      peer.on('close', () => {
        console.log(`Disconnected from articles peer (${type.type} port ${type.port})`)
        self.stats.set('articlepeers', swarm.connections.length).value()
      })
    })

    self.articles.on('download', data => speed(data.length))

    if (self.queuedDownloads.length > 0) {
      console.log('Processing queued downloads')
      self.queuedDownloads.forEach(entry => self.download(entry.article, entry.cb))
      self.queuedDownloads = []
    }
  }

  self.toggleActive = () => {
    self.stats.set('active', !self.stats.get('active').value()).value()
  }

  // return an object of data about this datasource
  self.data = () => {
    return {
      key: self.key,
      name: self.name,
      description: self.description,
      stats: self.stats.getState(),
      loading: self.loading,
      active: self.stats.get('active').value(),
      live: self.archive.live
    }
  }

  // close all databases
  self.close = cb => {
    self.stats.write()
    self.archive.close(
      () => self.db.close(
        () => fs.remove(self.datadir, cb)
      )
    )
  }

  // close all databases, then delete the datasource directory
  self.remove = cb => self.close(() => fs.remove(self.datadir, cb))

  self.getArticleEntries = (article, cb) => {
    const entries = []
    self.filedb.createReadStream(
      {
        gte: `articles/${article.path}`,
        lte: `articles/${article.path}${String.fromCodePoint(0xFFFF)}`,
        keys: false
      }
    ).on(
      'data', data => entries.push(data)
    ).on(
      'error', err => cb(err)
    ).on(
      'end', () => cb(null, entries)
    ).on(
      'close', () => cb(null, entries)
    )
  }

  self.entrysetDownloadProgress = entries => {
    let totalBlocks = 0
    let downloadedBlocks = 0

    entries.forEach(entry => {
      downloadedBlocks += self.articles.countDownloadedBlocks(entry)
      totalBlocks += entry.blocks
    })

    return (downloadedBlocks / totalBlocks) * 100
  }

  self.articleDownloadProgress = (article, cb) => {
    self.getArticleEntries(article, (err, entries) => {
      if (err) return cb(err)

      article.progress = self.entrysetDownloadProgress(entries)
      cb(null, article.progress)
    })
  }

  self.download = (article, cb) => {
    if (!self.articles) {
      self.queuedDownloads.push({ article: article, cb: cb })
      return
    }

    self.getArticleEntries(article, (err, entries) => {
      if (err) return cb(err)

      const stats = {
        started: Date.now(),
        source: self.key,
        id: article.id,
        files: entries,
        progress: self.entrysetDownloadProgress(entries)
      }
      self._downloads.push(stats)

      const updateStats = () => {
        stats.progress = self.entrysetDownloadProgress(entries)
        article.progress = stats.progress
      }

      updateStats()

      const timerId = setInterval(updateStats, 200)
      const alldone = require('./alldone')(entries.length, err => {
        if (err) return cb(err)
        clearInterval(timerId)
        remove(self._downloads, stats)
        cb()
      })

      entries.forEach(hit => self.articles.download(hit, alldone))
    })
  }

  self.downloads = () => ({ list: self._downloads.slice(), speed: speed() })
}

module.exports = Datasource
