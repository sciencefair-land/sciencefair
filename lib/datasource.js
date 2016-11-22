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
const pump = require('pump')
const pumpify = require('pumpify')
const yuno = require('yunodb')
const sum = require('lodash/sum')
const remove = require('lodash/remove')
const merge = require('lodash/merge')
const speed = require('speedometer')()

const debug = require('debug')('sciencefair')
const debugStream = require('debug-stream')(debug)

const C = require('./constants')

function Datasource (key) {
  if (!(this instanceof Datasource)) return new Datasource(key)

  const self = this
  self.loading = true

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
      return cb(null, db)
    })
  }

  // connect to the hyperdrive swarm and activate the DB
  self.connect = cb => {
    if (self.connected) return cb()
    console.log('connecting')

    // callback after an error, or when both database and hyperdrive
    // (_feed.json) are connected
    const done = require('../lib/alldone')(2, err => {
      if (err) return cb(err)
      console.log(`source ${self.name || self.key}: database and hyperdrive connected`)
      cb()
    })

    self.connectdb(done)

    try {
      self.archive = self.drive.createArchive(
        new Buffer(self.key, 'hex'),
        {
          live: false,
          sparse: false,
          file: function (name) {
            return raf(filepath(name))
          }
        }
      )
    } catch (err) {
      return done(err)
    }

    self.archive.on('download', data => speed(data.length))

    const swarm = swarmer(self.archive)

    swarm.on('connection', (peer, type) => {
      self.stats.set('peers', swarm.connections.length).value()
      peer.on('close', () => {
        self.stats.set('peers', swarm.connections.length).value()
      })
    })

    const loadjson = err => {
      if (err) return done(err)

      fs.readJson(filepath('_feed.json'), (err, obj) => {
        if (err) return done(err)

        Object.assign(self, obj)
        done()
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
      self.archive.list({ live: false }).on('data', entry => {
        if (entry.name === '_feed.json') {
          fetchjson(entry)
          if (!(self.stats.get('articleCount').value())) countArticles()
        }
      })
    }

    if (self.stats.get('active').value()
        && !(self.stats.get('metadataSync.finished').value())) {
      console.log('Resuming metadata sync')
      self.syncMetadata(
        err => console.log('error resuming datasource sync:', err)
      )
    }

    self.connected = true
  }

  // load a bibjson metadata entry
  self.loadEntry = entry => {
    return fs.readJsonSync(path.join(self.datadir, entry.name))
  }

  // streaming check if the entry is a metadata file, and if so
  // that it has been downloaded
  self.ensureMetaFile = through.ctor({ objectMode: true }, (entry, enc, next) => {
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
    if (self.stats.get('metadataSync.finished').value()) return cb()

    var end
    var metadataPos = self.stats.get('metadataSync.done').value() || 0
    const pageSize = 100

    const pageMetadata = () => {
      const count = through.ctor({ objectMode: true }, (data, enc, next) => {
        metadataPos += 1
        next(null, data)
      })

      const mapfile = through.ctor({ objectMode: true }, (data, enc, next) => {
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
      })

      const done = err => {
        if (err) return cb(err)

        if (metadataPos < end) {
          self.stats.get('metadataSync').assign({
            done: metadataPos,
            finished: false
          }).value()
          pageMetadata()
        } else {
          self.stats.get('metadataSync').assign({
            done: metadataPos,
            finished: true
          }).value()
          cb()
        }
      }

      pumpify.obj(
        list,
        count(),
        mapfile(),
        self.ensureMetaFile(),
        self.db.add(done)
      )
    }

    self.archive.metadata.open(() => {
      end = self.archive.metadata.blocks - 1

      self.stats.get('metadataSync').assign({
        total: end,
        done: metadataPos
      }).value()

      pageMetadata()
    })
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
