var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var levelup = require('levelup')
var path = require('path')
var exists = require('path-exists')
var mkdirp = require('mkdirp')
var fs = require('fs')

inherits(Project, EventEmitter)

function Project (opts) {
  if (!(this instanceof Project)) return new Project(opts)
  var self = this

  self.dir = opts.dir
  mkdirp(self.dir)

  self.dbdir = path.join(self.dir, 'leveldb')
  self.db = levelup(self.dbdir, { valueEncoding: 'json' })

  self.size = null
  self.changed = true

  self.getSize = function (cb) {
    if (!self.changed) {
      cb(self.size)
      return
    }

    var n = 0
    self.db
      .createKeyStream()
      .on('data', function () { n += 1 })
      .on('end', function () {
        self.size = n
        self.changed = false
        cb(n)
      })
  }

  self.setup = function (opts) {
    var configpath = path.join(self.dir, 'project.json')
    console.log(configpath)
    if (!exists.sync(configpath)) {
      self.created = new Date()
      fs.writeFileSync(configpath, JSON.stringify({
        name: opts.name,
        created: self.created.toISOString()
      }))
      self.name = opts.name
    } else {
      var config = require(configpath)
      self.name = config.name
      self.created = new Date(config.created)
    }
    self.getSize(function () {
      // noop
    })
  }

  self.setup(opts)

  self.put = function (paper, cb) {
    self.db.put(paper.getId(), paper, function (err) {
      self.changed = true
      cb(err)
    })
  }

  self.putBatch = function (papers, cb) {
    var commands = papers.map(function (paper) {
      return {
        type: 'put',
        key: paper.getId(),
        paper: paper.serialize()
      }
    })
    self.db.batch(commands, function (err) {
      self.changed = true
      cb(err)
    })
  }

  self.get = self.db.get

  self.getBatch = function (keys, cb) {
    keys.forEach(function (key) {
      self.get(key, cb)
    })
  }

  self.createReadStream = self.db.createReadStream

  self.del = function (key, cb) {
    self.db.del(key, function (err) {
      self.changed = true
      cb(err)
    })
  }

  self.delBatch = function (keys, cb) {
    self.db.batch(keys.map(function (key) {
      return {
        type: 'del',
        key: key
      }
    }), function () {
      self.changed = true
      cb()
    })
  }

  self.forEach = function (fn, cb) {
    self.createReadStream()
      .on('data', function (data) {
        fn(data)
      })
      .on('error', function (err) {
        cb(err)
      })
      .on('end', function () {
        cb(null)
      })
  }
}

module.exports = Project
