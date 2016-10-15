const path = require('path')

const hyperdrive = require('hyperdrive')
const level = require('level')
const raf = require('random-access-file')
const fs = require('fs-extra')
const mkdirp = require('mkdirp').sync
const through = require('through2')
const pump = require('pump')
const yuno = require('yunodb')
const after = require('lodash/after')

const C = require('./constants')

function Datasource (key) {
  if (!(this instanceof Datasource)) {
    return new Datasource(key)
  }

  const self = this

  self.key = key
  self.datadir = path.join(C.DATASOURCES_PATH, key)
  mkdirp(self.datadir)
  console.log('creating datasource with key', key, 'in dir', self.datadir)

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
      if (err) cb(err)
      self.db = db
      cb(null, db)
    })
  }

  // connect to the hyperdrive swarm and activate the DB
  self.connect = cb => {
    if (self.connected) cb()

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
      cb(e)
    }

    const swarm = swarmer(self.archive)

    swarm.on('connection', (peer, type) => {
      self.updateStats({ peers: swarm.connections })
      console.log(self.stats)
      peer.on('close', () => {
        self.updateStats({ peers: swarm.connections })
      })
    })

    console.log('archive created')

    const load = entry => {
      console.log('got info entry')

      self.updateStats({
        size: self.archive.metadata.blocks - 1
      })

      const loadjson = err => {
        if (err) cb(err)

        fs.readJson(filepath('sciencefair.json'), (err, obj) => {
          if (err) cb(err)

          Object.assign(self, obj)

          console.log('loaded datasource info', obj)

          self.connectdb(cb)
        })
      }

      if (!self.archive.isEntryDownloaded(entry)) {
        console.log('downloading info')
        self.archive.download(entry, loadjson)
      } else {
        loadjson()
      }
    }

    const listing = self.archive.list({ live: false }, (err, entries) => {
      if (err) cb(err)

      console.log('entries', entries)
    }).on('data', entry => {
        console.log(entry)
        if (entry.name === 'sciencefair.json') load(entry)
      })
      .on('error', err => cb(err))

    console.log(listing)

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
  }

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

  // return an object of data about this datasource
  self.data = () => {
    return {
      key: self.key,
      name: self.name,
      description: self.description,
      stats: self.stats
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
    try {
      const ds = datasources[key] || Datasource(key)
      datasources[key] = ds
      cb(null, ds)
    } catch (err) {
      cb(err)
    }
  },
  all: () => Object.keys(datasources).map(key => datasources[key]),
  del: key => datasources[key].remove(() => { delete datasources[key] })
}
