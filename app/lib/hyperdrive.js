var hyperdrive = require('hyperdrive')
var level = require('level')
var raf = require('random-access-file')
var untildify = require('untildify')
var path = require('path')
var exists = require('path-exists').sync
var mkdirp = require('mkdirp').sync

var dir = untildify('~/.sciencefair/data/elife_dws/')
mkdirp(dir)
var key = '4b2e3d9a1a41f44658f3f89afba5e0c0e166bcbe20c5bcc276ef3828ca4db717'

var drive = hyperdrive(level(untildify('~/.sciencefair/data/elife_dws.db')))
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
  console.log(id)
  pump(archive.list(), through.obj(visit), cb)

  function visit (entry, enc, cb) {
    var folder = entry.name.split('/')[0]
    if (folder === id) {
      console.log('found entry, downloading')
      return archive.download(entry, cb)
    }
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
  location: untildify('~/.sciencefair/data/elife_dws.yuno'),
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
  dir: 'elife_dws',
  connect: connect,
  downloadPaper: downloadPaper
}

function downloadPaper (paper, cb) {
  if (paper.assetPaths().length > 0) {
    cb()
  } else {
    download(paper.path, cb)
  }
}

function connect (cb) {
  var db = yuno(dbopts, (err, dbhandle) => {
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
