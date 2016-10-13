const hyperdrive = require('hyperdrive')
const level = require('level')
const raf = require('random-access-file')
const path = require('path')
const fs = require('fs')
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

  const dbpath = () => path.join(self.datadir, 'hyper.drive')
  const filepath = file => path.join(self.datadir, file)

  const db = level(dbpath())
  self.drive = hyperdrive(db)

  const swarmer = require('hyperdrive-archive-swarm')

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

  self.connect = cb => {
    self.archive = self.drive.createArchive(
      key,
      {
        live: false,
        file: function (name) {
          return raf(filepath(name))
        }
      }
    )

    const swarm = swarmer(self.archive)

    swarm.on('connection', (peer, type) => {
      console.log('connected to', swarm.connections, 'peers')
      peer.on('close', () => console.log('peer disconnected'))
    })

    yuno(dbopts, (err, db) => {
      if (err) cb(err)
      self.db = db
      cb(null, db)
    })
  }

  self.loadEntry = entry => {
    return JSON.parse(fs.readFileSync(path.join(self.datadir, entry.name)))
  }

  self.syncMetadata = cb => self.isMetadataSynced((err, synced) => {
    if (err) cb(err)
    if (synced) {
      console.log('all metadata already synced')
      cb()
    }

    const meta = []

    const visit = (entry, next) => {
      console.log(entry)
      if (/^meta.*json$/.test(entry.name)) {
        if (self.archive.isEntryDownloaded(entry)) {
          console.log(entry.name, 'metadata already downloaded')
          meta.push(self.loadEntry(entry))
          next()
        } else {
          console.log('downloading metadata', entry.name)
          self.archive.download(entry, err => {
            if (err) {
              console.log('error downloading', entry)
            } else {
              meta.push(self.loadEntry(entry))
            }
            next()
          })
        }
      } else {
        next()
      }
    }

    const done = () => {
      console.log('METADATA DOWNLOADS DONE')
      if (err) return cb(err)
      console.log('adding', meta.length, 'articles to index')
      console.log(meta)

      self.db.add(meta, err => {
        if (err) return cb(err)

        self.markMetadataSynced(cb)
      })
    }

    self.archive.list((err, entries) => {
      if (err) return cb(err)

      const index = after(entries.length, done)

      entries.forEach(entry => visit(entry, index))
    })
  })

  self.markMetadataSynced = cb => self.db.docstore.put(C.DATASOURCE_SYNCED, true, cb)

  self.isMetadataSynced = cb => {
    self.db.docstore.get(C.DATASOURCE_SYNCED, (err, value) => {
      if (err) {
        if (err.type === 'NotFoundError') return cb(null, false)
        else cb(err)
      } else {
        cb(null, value)
      }
    })
  }

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
}

module.exports = Datasource
