const path = require('path')
const events = require('events')

const inherits = require('inherits')

const portfinder = require('portfinder')
const low = require('lowdb')
const hyperdrive = require('hyperdrive')
const storage = require('dat-storage')
const walker = require('folder-walker')
const fs = require('fs-extra')
const mkdirp = require('mkdirp').sync
const through = require('through2')
const pumpify = require('pumpify')
const yuno = require('yunodb')
const sum = require('lodash/sum')
const remove = require('lodash/remove')
const assign = require('lodash/assign')
const equals = require('lodash/isEqual')
const speed = require('speedometer')
const discover = require('hyperdiscovery')
const defaults = require('lodash/defaults')
const alldone = require('./alldone')
const paper = require('./getpaper')

const multiprogress = require('./fs-readstreams-progress')
const collectStats = require('./fs-collect-stats')

const debug = require('debug')('sciencefair:datasource')

const C = require('../../constants')

function Datasource (key, opts) {
  if (!(this instanceof Datasource)) return new Datasource(key, opts)
  events.EventEmitter.call(this)

  if (!opts) opts = {}
  defaults(opts, {
    diskfirst: false
  })

  const self = this
  debug('new datasource:', self)

  self.opts = opts
  self.loading = true
  self.queuedDownloads = []

  self.name = 'key:' + key.substring(0, 6) + '...'
  self.key = key
  self.datadir = path.join(C.DATASOURCES_PATH, key)
  mkdirp(self.datadir)

  self._downloads = []

  // stats about the datasource are held in memory and persisted in JSON
  const statspath = path.join(self.datadir, 'source.stats')
  self.stats = low(statspath)
  self.stats.defaults({
    active: opts.active,
    peers: 0,
    metadataSync: {
      total: 0,
      done: 0,
      finished: false
    }
  }).write()

  // prepare the hyperdrive
  self.jsondir = path.join(self.datadir, 'meta_feed')
  self.articledir = path.join(self.datadir, 'article_feed')
  self.filepath = file => path.join(self.articledir, file)

  // prepare the search index
  const dbopts = {
    location: path.join(self.datadir, 'yuno.db'),
    keyField: '$.id',
    appendOnly: true,
    wildcard: false,
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

  // monitor speed
  self._downspeed = speed()
  self.downspeed = (i, data) => self._downspeed(data.length)
  self._upspeed = speed()
  self.upspeed = (i, data) => self._upspeed(data.length)
  self.speed = () => { return { down: self._downspeed(), up: self._upspeed() } }

  // connect to the hyperdrive swarm and activate the DB
  self.connect = cb => {
    if (self.metadata) return cb()

    // callback after an error, or when both database and hyperdrive
    // (_feed.json) are connected
    const done = alldone(2, err => {
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
    self.metadata = hyperdrive(storage(self.jsondir), self.key, {
      latest: true,
      sparse: true,
      tcp: true,
      utp: true
    })

    self.metadata.once('ready', () => {
      debug('datasource metadata drive ready', self.key)

      portfinder.getPort((err, port) => {
        if (err) throw err

        self.metadataswarm = discover(self.metadata, {
          tcp: true,
          utp: true,
          port: port,
          live: true,
          upload: true,
          download: true,
          dht: false
        })
      })
    })

    self.metadata.once('content', () => {
      debug('archive length', self.metadata.metadata.length)

      self.metadata.content.on('download', self.downspeed)
      self.metadata.content.on('upload', self.upspeed)

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

  // begin or resume syncing metadata from the hyperdrive archive
  // and adding it to the search index
  self.syncmeta = cb => {
    if (self.stats.get('metadataSync').write().finished) {
      self.connected = true
      self.emit('connected')
      return cb()
    }
    // if (self.stats.get('metadataSync.finished').write()) return cb()
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
      data => data.type ==='file' && /^(\/|\\)meta(\/|\\).*json$/.test(data.name)
    )

    const getentry = require('./hyperdrive-sync-entry')(self.metadata)

    let n = 0
    let lastpcdone = 0
    const getprogress = through.ctor({ objectMode: true }, (data, _, next) => {
      n++
      if (n % 30 === 0 || n === self.articleCount) {
        const progress = {
          done: n,
          total: self.articleCount
        }
        const pcdone = Math.round((progress.done / progress.total) * 100)
        if (pcdone !== lastpcdone) {
          self.stats.get('metadataSync').assign(progress).write()
          self.emit('progress', progress)
        }
        lastprogress = progress
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
      }).write()
      self.emit('progress', 1)
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

    self.articles = hyperdrive(storage(self.articledir), self.articleFeed, {
      latest: true,
      sparse: true,
      tcp: true,
      utp: true
    })

    self.articles.once('ready', () => {
      debug('datasource articles drive ready', self.articleFeed)

      portfinder.getPort((err, port) => {
        if (err) throw err

        self.articlesswarm = discover(self.articles, {
          tcp: true,
          utp: true,
          port: port,
          live: true,
          upload: true,
          download: true,
          dht: false
        })

        self.articlesswarm.on('connection', (peer, type) => {
          self.stats.set('peers', self.articlesswarm.connections.length).write()
          peer.on('close', () => {
            self.stats.set('peers', self.articlesswarm.connections.length).write()
          })
        })
      })
    })

    self.articles.once('content', () => {
      self.articles.content.on('download', self.downspeed)
      self.articles.content.on('upload', self.upspeed)

      if (self.queuedDownloads.length > 0) {
        debug('Processing queued downloads')
        self.queuedDownloads.forEach(entry => paper(entry).download())
        self.queuedDownloads = []
      }
    })
  }

  self.toggleActive = () => {
    self.stats.set('active', !self.stats.get('active').write()).write()
  }

  self.setActive = () => {
    self.stats.set('active', true).write()
  }

  // return an object of data about this datasource
  self.data = () => {
    return {
      key: self.key,
      name: self.name,
      description: self.description,
      stats: self.stats.getState(),
      loading: self.loading,
      active: self.stats.get('active').write(),
      live: self.archive ? self.archive.live : false
    }
  }

  // close all databases
  self.close = cb => {
    self.stats.write()
    const toclose = [self.metadata, self.articles, self.db]
    const done = alldone(toclose.length, cb)

    toclose.forEach(item => {
      try {
        item ? item.close.bind(item)(done) : done()
      } catch (err) {
        debug(err)
      }
    })
  }

  // close all databases, then delete the datasource directory
  self.remove = cb => self.close(
    err => err ? cb(err) : fs.remove(self.datadir, cb)
  )

  self.articlestats = (files, cb) => process.nextTick(() => {
    const stats = {
      size: 0,
      local: 0,
      files: {}
    }

    files.forEach(f => stats.files[f] = {})

    const done = alldone(2, err => {
      if (err) return cb(err)
      stats.progress = stats.local / stats.size
      Object.keys(stats.files).forEach(f => {
        const file = stats.files[f]
        file.progress = file.local / file.size
      })
      cb(null, stats)
    })

    const strippath = filepath => filepath.replace(self.articlepath, '')

    // get the current size on disk
    const errorStat = { size: 0 }
    collectStats(files.map(self.filepath), { errorStat: errorStat }, (err, data) => {
      if (err) return done(err)
      stats.local = data.summary.size
      data.files.forEach(f => {
        const file = strippath(f.path)
        stats.files[file].local = f.size
      })
      done()
    })

    // get the size in the archive
    collectStats(files, { fs: self.articles }, (err, data) => {
      if (err) return done(err)
      stats.size = data.summary.size
      data.files.forEach(f => stats.files[f.path].size = f.size)
      done()
    })
  })

  self.ready = () => (!!self.metadata && !!self.articles)

  self.download = article => {
    if (!self.articles) {
      self.queuedDownloads.push(article)
      return
    }

    if (self._downloads.find(d => d.key === article.key)) {
      debug('already downloading', article.key)
      return
    }

    const download = { key: article.key }
    self._downloads.push(download)

    const update = data => Object.assign(data, download)

    const remove = () => {
      self._downloads = self._downloads.filter(x => x.key !== download.key)
    }

    const stream = multiprogress(article.files, { fs: self.articles })
    stream.on('progress', update).on('end', remove).drain()
    self.emit('download', article, stream)

    return stream
  }

  self.downloads = () => ({
    list: self._downloads.slice(),
    speed: self.speed(),
    key: self.key
  })

  self.clear = (files, cb) => {
    if (!(files instanceof Array)) files = [files]

    const done = alldone(files.length, cb)

    files.forEach(file => self.articles.tree.get(file, (err, entry) => {
      if (err) return done(err)

      const start = entry.offset
      const end = start + entry.blocks
      const bytes = {
        byteOffset: entry.byteOffset,
        byteLength: entry.size
      }

      self.articles.content.cancel(start, end)
      self.articles.content.clear(start, end, bytes, done)
    }))
  }

  if (self.opts.diskfirst) self.initFromDisk()
}

inherits(Datasource, events.EventEmitter)

module.exports = Datasource
