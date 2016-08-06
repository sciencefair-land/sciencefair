const hyperdrive = require('hyperdrive')
const level = require('level')
const raf = require('random-access-file')
const path = require('path')
const exists = require('path-exists').sync
const mkdirp = require('mkdirp').sync
const through = require('through2')
const pump = require('pump')
var yuno = require('yunodb')

function dbpath (datadir) {
  return path.join(datadir, 'hyper.drive')
}

function filepath (datadir, file) {
  return path.join(datadir, 'articles', file)
}

function Hyperdrive (key, datadir) {
  if (!(this instanceof Hyperdrive)) {
    return new Hyperdrive(key, datadir)
  }

  this.key = key
  this.datadir = datadir
  mkdirp(datadir)

  const db = level(dbpath(datadir))
  this.drive = hyperdrive(db)

  const discovery = require('discovery-swarm')
  const defaults = require('datland-swarm-defaults')

  this.connect = (cb) => {
    this.archive = this.drive.createArchive(
      key,
      {
        live: true,
        file: function (name) {
          return raf(filepath(datadir, name))
        }
      }
    )

    swarm.join(key)

    const db = yuno(dbopts, (err, dbhandle) => {
      if (err) throw err

      db = dbhandle
      db.datasource = { name: 'eLife hyperdrive' }

      if (!exists(dbopts.location)) {
        var meta = []
        metadata(meta, function () {
          db.add(meta, function (err) {
            if (err) cb(err)
            cb(null, db)
          })
        })
      } else {
        cb(null, db)
      }
    })
  }

  this.metadata = () => {
    pump(archive.list(), through.obj(visit), cb)

    function visit (entry, enc, cb) {
      var parts = path.parse(entry.name)
      if (parts.ext === '.json') {
        meta.push(require(path.join(dir, entry.name)))
      }
      cb()
    }
  }

  this.syncOne = () => {

  }
}
