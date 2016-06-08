var hyperdrive = require('hyperdrive')
var level = require('level')
var raf = require('random-access-file')
var untildify = require('untildify')
var path = require('path')
var exists = require('path-exists').sync
var dir = untildify('~/.sciencefair/data/elife/')
var key = 'c0b6950cde25661786cc75b8951e0bf4a6a20e10dc8f3025ab8b60ba16682dbb'

var drive = hyperdrive(level(untildify('~/.sciencefair/data/elife.db')))
var archive = drive.createArchive(
  key,
  {
    live: true,
    file: function (name) {
      return raf(dir + name)
    }
  }
)

var discovery = require('discovery-swarm')
var defaults = require('datland-swarm-defaults')

var swarm = discovery(defaults({
  hash: false,
  stream: function () {
    return archive.replicate()
  }
}))

swarm.join(archive.discoveryKey)

var through = require('through2')
var pump = require('pump')

function download (id, cb) {
  pump(archive.list(), through.obj(visit), cb)

  function visit (entry, enc, cb) {
    var folder = entry.name.split('/')[0]
    if (folder === id) return archive.download(entry, cb)
    cb()
  }
}

function metadata (meta, cb) {
  pump(archive.list(), through.obj(visit), cb)

  function visit (entry, enc, cb) {
    var parts = path.parse(entry.name)
    if (parts.ext === '.json') {
      meta.push(require(path.join(dir, entry.name)))
    }
    cb()
  }
}

var yuno = require('yunodb')

var dbopts = {
  location: untildify('~/.sciencefair/data/elife.yuno'),
  keyField: '$.identifier[?(@.type === "doi")].id',
  indexMap: {
    'title': true,
    'author[*].surname': true,
    'year': false
  }
}

module.exports = {
  name: 'eLife hyperdrive',
  key: key,
  dir: 'elife',
  connect: connect,
  downloadPaper: downloadPaper
}

function downloadPaper (paper, cb) {
  download(paper.path, cb)
}

function connect (cb) {
  var get = !(exists(untildify('~/.sciencefair/data/elife.yuno')))

  var db = yuno(dbopts, (err, dbhandle) => {
    if (err) throw err

    db = dbhandle
    db.datasource = { name: 'eLife hyperdrive' }

    if (get) {
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
