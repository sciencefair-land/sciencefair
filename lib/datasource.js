const path = require('path')

const hyperdrive = require('hyperdrive')
const level = require('level')
const raf = require('random-access-file')
const fs = require('fs-extra')
const mkdirp = require('mkdirp').sync
const through = require('through2')
const pump = require('pump')
const pumpify = require('pumpify')
const yuno = require('yunodb')

const C = require('./constants')

function Datasource (key) {
  if (!(this instanceof Datasource)) {
    return new Datasource(key)
  }

  const self = this
  self.loading = true

  self.key = key
  self.datadir = path.join(C.DATASOURCES_PATH, key)
  mkdirp(self.datadir)

  // stats about the datasource are held in memory and persisted in a levelDB
  self.stats = {}
  const statspath = path.join(self.datadir, 'source.stats')
  self.statsdb = level(statspath, { valueEncoding: 'json' })

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
        key,
        {
          live: true,
          file: function (name) {
            return raf(filepath(name))
          }
        }
      )
    } catch (e) {
      return cb(e)
    }

    const swarm = swarmer(self.archive)

    swarm.on('connection', (peer, type) => {
      self.updateStats({ peers: swarm.connections })
      peer.on('close', () => {
        self.updateStats({ peers: swarm.connections })
      })
    })

    const load = entry => {
      const loadjson = err => {
        if (err) return cb(err)

        fs.readJson(filepath('sciencefair.json'), (err, obj) => {
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
      if (entry.name === 'sciencefair.json') load(entry)
      else if (/^meta.*json$/.test(entry.name)) {
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
    console.log('ensuring metafile for entry', entry)
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
    console.log('syncing metadata')
    if (self.statsLoaded && self.stats.metadataSynced) return cb()

    const end = self.archive.metadata.blocks - 1
    const pageSize = 1000
    let metadataPos = self.stats.metadataPos || 0
    console.log('starting metadataPos', metadataPos)
    console.log('end', end)

    const pageMetadata = () => {
      let n = 0

      const count = through.obj((data, enc, next) => {
        n++
        console.log('counting data', data)
        next(null, data)
      })

      const done = err => {
        console.log('done yo')
        if (err) return cb(err)

        metadataPos += n

        console.log('metadataPos', metadataPos)

        self.updateStats({ metadataPos: metadataPos })

        if (metadataPos < end) {
          pageMetadata()
        } else {
          self.updateStats({ metadataSynced: true })
        }
      }

      const list = self.archive.list({
        live: false,
        offset: metadataPos,
        limit: pageSize
      })

      pumpify.obj(list, count, self.ensureMetaFile, self.db.add(done))
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
      active: self.active
    }
  }

  // close all databases, then delete the datasource directory
  self.remove = () => {
    self.hyperdb.close(
      () => self.statsdb.close(
        () => self.db.close(
          () => fs.remove(self.datadir)
        )
      )
    )
  }
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
