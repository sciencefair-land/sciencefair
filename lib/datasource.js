const path = require('path')

const hyperdrive = require('hyperdrive')
const level = require('level')
const streaminto = require('level-write-stream')
const multi = require('multi-write-stream')
const eos = require('end-of-stream')
const raf = require('random-access-file')
const fs = require('fs-extra')
const mkdirp = require('mkdirp').sync
const through = require('through2')
const pump = require('pump')
const pumpify = require('pumpify')
const yuno = require('yunodb')
const sum = require('lodash/sum')
const remove = require('lodash/remove')
const speed = require('speedometer')()

const C = require('./constants')

function Datasource (key) {
  if (!(this instanceof Datasource)) return new Datasource(key)

  const self = this
  self.loading = true

  self.key = key
  self.datadir = path.join(C.DATASOURCES_PATH, key)
  mkdirp(self.datadir)

  self._downloads = []

  // stats about the datasource are held in memory and persisted in a levelDB
  self.stats = {
    peers: 0,
    metadataSync: {
      total: 0,
      done: 0,
      finished: false
    }
  }
  const statspath = path.join(self.datadir, 'source.stats')
  self.statsdb = level(statspath, { valueEncoding: 'json' })

  // mapping of article IDs to filepaths stored in levelDB
  const filedbpath = path.join(self.datadir, 'file.map')
  self.filedb = level(filedbpath, { valueEncoding: 'json' })

  // update datasource stats object and send update to DB
  self.updateStats = update => {
    Object.assign(self.stats, update)
    self.statsdb.put('stats', self.data(), err => {
      if (err) {
        console.error(`Failed to write stats for datsource ${self.key}`, err)
      }
    })
  }

  // load stats from DB if not already loaded
  self.loadStats = () => {
    if (self.statsLoaded) return
    self.statsdb.get('stats', (err, data) => {
      if (err) return
      Object.assign(self, data)
    })
  }
  self.loadStats()

  // prepare the hyperdrive
  const dbpath = path.join(self.datadir, 'hyper.drive')
  const filepath = file => path.join(self.datadir, file)

  const hyperdb = level(dbpath)
  self.drive = hyperdrive(hyperdb)

  const swarmer = require('hyperdrive-archive-swarm')

  // prepare the search index
  const dbopts = {
    location: path.join(self.datadir, 'yuno.db'),
    keyField: '$.identifier[0].id',
    indexMap: {
      'title': true,
      'author': true,
      'date': false,
      'identifier': false,
      'abstract': true
    }
  }

  self.connectdb = cb => {
    yuno(dbopts, (err, db) => {
      if (err) return cb(err)
      self.db = db
      self.loading = false
      console.log('connected', self.key)
      return cb(null, db)
    })
  }

  // connect to the hyperdrive swarm and activate the DB
  self.connect = cb => {
    if (self.connected) return cb()
    console.log('connecting', self.key)

    try {
      self.archive = self.drive.createArchive(
        new Buffer(key, 'hex'),
        {
          live: false,
          sparse: false,
          file: function (name) {
            return raf(filepath(name))
          }
        }
      )
    } catch (e) {
      console.log('error connecting datasource')
      return cb(e)
    }

    self.archive.on('download', data => speed(data.length))

    const swarm = swarmer(self.archive)

    swarm.on('connection', (peer, type) => {
      console.log('connected to a peer')
      self.updateStats({ peers: swarm.connections })
      peer.on('close', () => {
        self.updateStats({ peers: swarm.connections })
      })
    })

    const load = entry => {
      const loadjson = err => {
        if (err) return cb(err)

        fs.readJson(filepath('_feed.json'), (err, obj) => {
          if (err) return cb(err)

          Object.assign(self, obj)

          self.connectdb(cb)
        })
      }

      if (!self.archive.isEntryDownloaded(entry)) {
        self.archive.download(entry, loadjson)
      } else {
        loadjson()
      }
    }

    let articleCount = 0
    self.archive.list({ live: false }).on('data', entry => {
      if (entry.name === '_feed.json') {
        console.log('found feed information')
        load(entry)
      } else if (/^meta.*json$/.test(entry.name)) {
        articleCount++
      }
    })
    .on('error', err => cb(err))
    .on('close', () => self.updateStats({ articleCount: articleCount }))
    .on('end', () => self.updateStats({ articleCount: articleCount }))

    self.connected = true
  }

  // load a bibjson metadata entry
  self.loadEntry = entry => {
    return JSON.parse(fs.readFileSync(path.join(self.datadir, entry.name)))
  }

  // streaming check if the entry is a metadata file, and if so
  // that it has been downloaded
  self.ensureMetaFile = through.obj((entry, enc, next) => {
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

  // begin or resume syncing metadata from the hyperdrive archive
  // and adding it to the search index
  self.syncMetadata = cb => {
    if (self.statsLoaded && self.stats.metadataSync.finished) return cb()

    const end = self.archive.metadata.blocks - 1

    self.updateStats({
      metadataSync: {
        total: end,
        done: self.stats.metadataSync.done || 0,
        finished: false
      }
    })
    const pageSize = 100

    const pageMetadata = () => {
      var n = 0

      console.log('syncing from', metadataPos)
      const count = through.obj((data, enc, next) => {
        n++
        console.log(n, 'synced')
        next(null, data)
      })

      const mapfile = through.obj((data, enc, next) => {
        if (data.name.length > 0) {
          self.filedb.put(data.name, data, err => next(err, data))
        } else {
          next(null, data)
        }
      })

      const list = self.archive.list({
        live: false,
        offset: metadataPos,
        limit: pageSize
      }, (  ) => {

      })

      const done = err => {
        if (err) return cb(err)

        metadataPos += n
        console.log('synced', n, 'more')

        if (metadataPos < end) {
          self.updateStats({
            metadataSync: {
              total: end,
              done: metadataPos,
              finished: false
            }
          })
          pageMetadata()
        } else {
          self.updateStats({
            metadataSync: {
              total: end,
              done: metadataPos,
              finished: true
            }
          })
        }
      }

      pumpify.obj(
        list,
        count,
        mapfile,
        self.ensureMetaFile,
        self.db.add(done)
      )
    }

    pageMetadata()
  }

  // sync all the files for a single article from the hyperdrive
  self.syncOne = (id, cb) => {
    pump(self.archive.list(), through.obj(visit), cb)

    function visit (entry, enc, cb) {
      var folder = entry.name.split('/')[0]
      if (folder === id) {
        return self.archive.download(entry, cb)
      }
      return cb()
    }
  }

  // return an object of data about this datasource
  self.data = () => {
    return {
      key: self.key,
      name: self.name,
      description: self.description,
      stats: self.stats,
      loading: self.loading,
      active: self.active,
      live: self.archive.live
    }
  }

  // close all databases, then delete the datasource directory
  self.remove = cb => {
    self.archive.close(
      () => self.statsdb.close(
        () => self.db.close(
          () => fs.remove(self.datadir, cb)
        )
      )
    )
  }

  self.getArticleEntries = (article, cb) => {
    const entries = []
    const path = article.path || article.document.path
    self.filedb.createReadStream(
      {
        gte: `articles/${path}`,
        lte: `articles/${path}${String.fromCodePoint(0xFFFF)}`,
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
      downloadedBlocks += self.archive.countDownloadedBlocks(entry)
      totalBlocks += entry.blocks
    })

    return totalBlocks === 0 ? 0 : downloadedBlocks / totalBlocks * 100
  }

  self.articleDownloadProgress = (article, cb) => {
    self.getArticleEntries(article, (err, entries) => {
      if (err) return cb(err)

      article.progress = self.entrysetDownloadProgress(entries)
      cb(null, article.progress)
    })
  }

  self.download = (article, cb) => {
    if (!article.path) article = article.document
    console.log('downloading', article)

    self.getArticleEntries(article, (err, entries) => {
      if (err) return cb(err)

      const stats = {
        started: Date.now(),
        source: self.key,
        id: article.identifier[0].id,
        files: entries,
        progress: self.entrysetDownloadProgress(entries)
      }
      self._downloads.push(stats)

      const updateStats = () => {
        stats.progress = self.entrysetDownloadProgress(entries)
      }

      updateStats()

      const timerId = setInterval(updateStats, 200)
      const alldone = require('./alldone')(entries.length, err => {
        if (err) return cb(err)
        clearInterval(timerId)
        remove(self._downloads, stats)
        cb()
      })

      entries.forEach(hit => self.archive.download(hit, alldone))
    })
  }

  self.downloads = () => ({ list: self._downloads.slice(), speed: speed() })
}

const datasources = {}

module.exports = {
  fetch: (key, cb) => {
    const ds = datasources[key] || Datasource(key)
    datasources[key] = ds
    return cb(null, ds)
  },
  all: () => Object.keys(datasources).map(key => datasources[key]),
  del: key => datasources[key].remove(() => { delete datasources[key] })
}
