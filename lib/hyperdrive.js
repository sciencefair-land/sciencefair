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

  const self = this

  self.key = key
  self.datadir = datadir
  mkdirp(datadir)

  const db = level(dbpath(datadir))
  self.drive = hyperdrive(db)

  const discovery = require('discovery-swarm')
  const defaults = require('datland-swarm-defaults')

  const dbopts = {
    location: datadir,
    keyField: '$.identifier[?(@.type === "doi")].id',
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
          return raf(filepath(datadir, name))
        }
      }
    )

    const swarm = discovery(defaults({
      hash: false,
      stream: () => {
        return self.archive.replicate()
      }
    }))

    swarm.join(key)

    yuno(dbopts, (err, db) => {
      if (err) throw err

      db.datasource = { name: 'eLife hyperdrive' }

      if (!exists(dbopts.location)) {
        var meta = []
        self.metadata(meta, function () {
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

  self.metadata = (meta, cb) => {
    pump(self.archive.list(), through.obj(visit), cb)

    function visit (entry, enc, cb) {
      var parts = path.parse(entry.name)
      if (parts.ext === '.json') {
        meta.push(require(path.join(self.datadir, entry.name)))
      }
      cb()
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

module.exports = Hyperdrive
