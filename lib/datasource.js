const hyperdrive = require('hyperdrive')
const level = require('level')
const raf = require('random-access-file')
const path = require('path')
const exists = require('path-exists').sync
const mkdirp = require('mkdirp').sync
const through = require('through2')
const pump = require('pump')
const yuno = require('yunodb')

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

  self.connect = (cb) => {
    self.archive = self.drive.createArchive(
      key,
      {
        live: true,
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

    yuno(dbopts, cb)
  }

  self.getmetadata = (cb) => {
    if (!exists(dbopts.location)) {
      var meta = []
      self.metadata(meta, function () {
        db.add(meta, function (err) {
          if (err) cb(err)
          cb(null, db)
        })
      })
    }
  }

  self.metadata = (meta, cb) => {
    pump(self.archive.list(), through.obj(visit), cb)

    function visit (entry, enc, cb2) {
      if (/^meta.*json$/.test(entry.name)) {
        self.archive.download(entry, err => {
          if (err) console.log('error downloading', entry)
          else {
            const article = require(path.join(self.datadir, entry.name))
            console.log('got metadata entry', article)
            meta.push(article)
          }
        })
      }
      cb2()
    }
  }

  self.syncOne = (id, cb) => {
    pump(self.archive.list(), through.obj(visit), cb)

    function visit (entry, enc, cb) {
      var folder = entry.name.split('/')[0]
      if (folder === id) {
        console.log('found entry, downloading')
        return self.archive.download(entry, cb)
      }
      cb()
    }
  }
}

module.exports = Datasource
