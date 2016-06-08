var hyperdrive = require('hyperdrive')
var level = require('level')
var raf = require('random-access-file')
var untildify = require('untildify')
var path = require('path')
var exists = require('path-exists').sync
var mkdirp = require('mkdirp').sync

var dir = untildify('~/.sciencefair/data/elife/')
mkdirp(dir)
var key = 'b179e1550a43916668fe580924ced04c6efba18aaa316067158ddfa35f49e148'

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
