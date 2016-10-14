const hyperdrive = require('hyperdrive')
const level = require('level')
const raf = require('random-access-file')
const path = require('path')
const fs = require('fs-extra')
const mkdirp = require('mkdirp').sync
const through = require('through2')
const pump = require('pump')
const yuno = require('yunodb')
const after = require('lodash/after')
const memoize = require('lodash/memoize')

const C = require('./constants')

function Datasource (key) {
  if (!(this instanceof Datasource)) {
    return new Datasource(key)
  }

  const self = this

  self.key = key
  self.datadir = path.join(C.DATASOURCES_PATH, key)
  mkdirp(self.datadir)

  // stats about the datasource are held in memory and persisted in a levelDB
  self.stats = {}
  const statspath = path.join(self.datadir, 'source.stats')
  self.statsdb = level(statspath)

  // update datasource stats object and send update to DB
  self.updateStats = update => {
    Object.assign(self.stats, update)
    const ops = Object.keys(update).map(
      k => { return { type: 'put', key: k, value: update[k] } }
    )
    self.statsdb.batch(ops)
  }

  // load stats from DB if not already loaded
  self.loadStats = () => {
    if (self.statsLoaded) return
    self.statsdb.createReadStream()
      .on('data', entry => { self.stats[entry.key] = entry.value })
      .on('error', err => {
        console.error(`Failed to load stats for datasource ${self.key}`, err)
        self.statsLoaded = false
      })
      .on('end', () => { self.statsLoaded = true })
      .on('close', () => { self.statsLoaded = true })
  }
  self.loadStats()

  // prepare the hyperdrive
  const dbpath = path.join(self.datadir, 'hyper.drive')
  const filepath = file => path.join(self.datadir, file)

  const hyperdb = level(dbpath)
  self.drive = hyperdrive(db)

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
      if (err) cb(err)
      self.db = db
      cb(null, db)
    })
  }

  // connect to the hyperdrive swarm and activate the DB
  self.connect = cb => {
    if (self.connected) cb()

    self.archive = self.drive.createArchive(
      key,
      {
        live: false,
        file: function (name) {
          return raf(filepath(name))
        }
      }
    )

    self.updateStats({
      size:  self.archive.metadata.blocks
    })


    self.archive.lookup('sciencefair.json', (err, entry) => {
      if (err) cb(err)

      const loadjson = err => {
        if (err) cb(err)

        fs.loadJson(filepath('sciencefair.json'), (err, obj) => {
          if (err) cb(err)

          Object.assign(self, obj)

          self.connectdb(cb)
        })
      }

      if (!self.archive.isEntryDownloaded(entry)) {
        self.archive.download(entry, loadjson)
      } else {
        loadjson()
      }
    })

    const swarm = swarmer(self.archive)

    swarm.on('connection', (peer, type) => {
      self.updateStats({ peers: swarm.connections })

      peer.on('close', () => {
        self.updateStats({ peers: swarm.connections })
      })
    })

    self.connected = true
  }

  // load a bibjson metadata entry
  self.loadEntry = entry => {
    return JSON.parse(fs.readFileSync(path.join(self.datadir, entry.name)))
  }

  // begin or resume syncing metadata from the hyperdrive archive
  // and adding it to the search index
  self.syncMetadata = cb => {
    if (self.statsLoaded && self.stats.metadataSynced) {
      cb()
    }

    const end = self.archive.metadata.blocks
    const pageSize = 1000
    let metadataPos = self.stats.metadataPos || 0

    const pageMetadata = () => {
      const meta = []

      const done = () => {
        if (err) return cb(err)

        self.db.add(meta, err => {
          if (err) return cb(err)

          metadataPos += meta.length

          self.updateStats({ metadataPos: metadataPos })

          if (metadataPos < end) {
            pageMetadata()
          } else {
            self.updateStats({ metadataSynced: true })
          }
        })
      }

      self.archive.list({
        live: false,
        offset: metadataPos,
        limit: pageSize
      }, (err, entries) => {
        if (err) return cb(err)

        const index = after(entries.length, done)

        entries.forEach(entry => {
          if (/^meta.*json$/.test(entry.name)) {
            if (self.archive.isEntryDownloaded(entry)) {
              meta.push(self.loadEntry(entry))
              index()
            } else {
              self.archive.download(entry, err => {
                if (err) {
                  console.log('error downloading', entry, err)
                } else {
                  meta.push(self.loadEntry(entry))
                }
                index()
              })
            }
          } else {
            index()
          }
        })
      })
    }
  })

  // sync all the files for a single article from the hyperdrive
  self.syncOne = (id, cb) => {
    pump(self.archive.list(), through.obj(visit), cb)

    function visit (entry, enc, cb) {
      var folder = entry.name.split('/')[0]
      if (folder === id) {
        return self.archive.download(entry, cb)
      }
      cb()
    }
  }

  self.setActive = self.updateStats({ active: true })
  self.setInactive = self.updateStats({ active: false })

  self.data = () => {

  }
}

module.exports = memoize(key => Datasource(key))
