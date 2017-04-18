const path = require('path')
const events = require('events')

const inherits = require('inherits')

const low = require('lowdb')
const hyperdrive = require('hyperdrive')
const walker = require('folder-walker')
const fs = require('fs-extra')
const mkdirp = require('mkdirp').sync
const through = require('through2')
const pumpify = require('pumpify')
const yuno = require('yunodb')
const sum = require('lodash/sum')
const remove = require('lodash/remove')
const assign = require('lodash/assign')
const speed = require('speedometer')()
const discover = require('hyperdiscovery')
const defaults = require('lodash/defaults')

const debug = require('debug')('sciencefair')

const C = require('./constants')

function Datasource (key, opts) {
  if (!(this instanceof Datasource)) return new Datasource(key, opts)
  events.EventEmitter.call(this)

  if (!opts) opts = {}
  defaults(opts, {
    diskfirst: false
  })

  const self = this
  self.opts = opts
  self.loading = true
  self.queuedDownloads = []
  debug('new datasource:', self)

  self.name = 'new datasource ' + key.substring(0, 6)
  self.key = key
  self.datadir = path.join(C.DATASOURCES_PATH, key)
  mkdirp(self.datadir)

  self._downloads = []

  // stats about the datasource are held in memory and persisted in JSON
  const statspath = path.join(self.datadir, 'source.stats')
  self.stats = low(statspath)
  self.stats.defaults({
    active: false,
    peers: 0,
    metadataSync: {
      total: 0,
      done: 0,
      finished: false
    }
  }).value()
  self.stats.read()

  // prepare the hyperdrive
  self.jsondir = path.join(self.datadir, 'meta_feed')
  self.articledir = path.join(self.datadir, 'article_feed')

  // prepare the search index
  const dbopts = {
    location: path.join(self.datadir, 'yuno.db'),
    keyField: '$.id',
    indexMap: {
      title: true,
      authorstr: true,
      abstract: true,
      author: false,
      date: false,
      tags: false,
      identifier: false,
      path: false,
      source: false,
      files: false,
      entryfile: false,
      id: false
    }
  }

  // connect to the hyperdrive swarm and activate the DB
  self.connect = cb => {
    if (self.metadata) return cb()

    // callback after an error, or when both database and hyperdrive
    // (_feed.json) are connected
    const done = require('../lib/alldone')(2, err => {
      if (err) return cb(err)
      self.maybeSyncMetadata()
      self.connectarticles()
      debug(`source ${self.name || self.key}: database and hyperdrive connected`)
      if (cb) cb()
    })

    self.connectmeta(done)
    self.connectdb(done)
  }

  self.connectmeta = cb => {
    self.metadata = hyperdrive(self.jsondir, self.key, { sparse: true })

    self.metadata.once('ready', () => {
      debug('datasource metadata drive ready', self.key)

      self.metadataswarm = discover(self.metadata, {
        tcp: false
      })
    })

    self.metadata.once('content', () => {
      debug('archive length', self.metadata.metadata.length)

      self.metadata.content.on('download', (index, data, from) => {
        speed(data.length)
      })

      self.metadata.readFile('/_feed.json', 'utf8', (err, data) => {
        if (err) throw err
        const parsed = JSON.parse(data)
        Object.assign(self, parsed)
        debug('read _feed.json, got source name:', parsed.name)
        if (!self.articleFeed) {
          const err = new Error('datasource is not valid - no article feed in the metadata')
          cb(err)
        } else {
          cb()
        }
      })
    })
  }

  self.connectdb = cb => {
    yuno(dbopts, (err, db) => {
      if (err) return cb(err)
      self.db = db
      self.loading = false
      return cb(null, db)
    })
  }

  self.maybeSyncMetadata = () => {
    debug('resuming metadata sync')
    self.syncmeta(
      err => {
        if (err) throw err
      }
    )
  }

  // load a bibjson metadata entry
  self.loadEntry = entry => fs.readJsonSync(path.join(self.datadir, entry.name))

  self.initFromDisk = cb => {
    console.log('INIT FRAWM DISK YA')
  }

  // begin or resume syncing metadata from the hyperdrive archive
  // and adding it to the search index
  self.syncmeta = cb => {
    if (self.stats.get('metadataSync').value().finished) {
      self.connected = true
      self.emit('connected')
      return cb()
    }
    // if (self.stats.get('metadataSync.finished').value()) return cb()
    debug('syncing metadata feed')

    // each history item looks like:
    // {
    //   "type": "put",
    //   "version": 3627,
    //   "name": "/meta/elife-27150-v2.json",
    //   "value": {
    //     "mode": 33188,
    //     "uid": 0,
    //     "gid": 0,
    //     "size": 769,
    //     "blocks": 1,
    //     "offset": 3626,
    //     "byteOffset": 7609175,
    //     "mtime": 1491369955265,
    //     "ctime": 1491369955265
    //   }
    // }

    const addname = require('./stream-obj-rename')({
      from: 'filepath',
      to: 'name'
    })

    const addsource = require('./stream-obj-xtend')({
      source: self.key
    })

    const filtermeta = require('./through-filter')(
      data => data.type ==='file' && /^\/meta\/.*json$/.test(data.name)
    )

    const getentry = require('./hyperdrive-sync-entry')(self.metadata)

    n = 0
    const getprogress = through.ctor({ objectMode: true }, (data, _, next) => {
      n++
      if (n % 35 === 0) {
        const progress = {
          done: n,
          total: self.articleCount
        }
        self.stats.get('metadataSync').assign(progress).value()
        self.emit('progress', progress)
      }
      next(null, data)
    })

    const getpaper = require('./hyperdrive-to-sciencefair-paper')()

    const getmeta = require('./stream-paper-meta')()

    const done = err => {
      if (err) return cb(err)
      self.stats.get('metadataSync').assign({
        done: self.articleCount,
        total: self.articleCount,
        finished: true
      }).value()
      self.emit('metadatasync:done')
      self.connected = true
      self.emit('connected')
      cb()
    }

    pumpify.obj(
      walker('/meta', { fs: self.metadata }),
      addname(),
      filtermeta(),
      getentry(),
      getprogress(),
      addsource(),
      getpaper(),
      getmeta(),
      self.db.add(done)
    )
  }

  self.connectarticles = () => {
    if (self.articles) return

    self.articles = hyperdrive(self.articledir, self.articleFeed, { sparse: true })

    self.articles.once('ready', () => {
      debug('datasource articles drive ready', self.articleFeed)

      self.articlesswarm = discover(self.articles)
      self.articlesswarm.on('connection', (peer, type) => {
        self.stats.set('peers', swarm.connections.length).value()
        peer.on('close', () => {
          self.stats.set('peers', swarm.connections.length).value()
        })
      })
    })

    self.articles.once('content', () => {
      self.articles.content.on('download', (index, data, from) => {
        speed(data.length)
      })

      if (self.queuedDownloads.length > 0) {
        console.log('Processing queued downloads')
        self.queuedDownloads.forEach(entry => self.download(entry.article, entry.cb))
        self.queuedDownloads = []
      }
    })
  }

  self.toggleActive = () => {
    self.stats.set('active', !self.stats.get('active').value()).value()
  }

  self.setActive = () => {
    self.stats.set('active', true).value()
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
      live: self.archive ? self.archive.live : false
    }
  }

  // close all databases
  self.close = cb => {
    self.stats.write()
    self.archive.close(
      () => self.db.close(cb)
    )
  }

  // close all databases, then delete the datasource directory
  self.remove = cb => self.close(() => fs.remove(self.datadir, cb))

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

    article.files.forEach(file => {
      console.log('article file', file)
    })
  }

  self.downloads = () => ({ list: self._downloads.slice(), speed: speed() })

  if (self.opts.diskfirst) self.initFromDisk()
}

inherits(Datasource, events.EventEmitter)

module.exports = Datasource
