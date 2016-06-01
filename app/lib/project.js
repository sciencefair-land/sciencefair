var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var levelup = require('levelup')
var path = require('path')
var exists = require('path-exists')
var mkdirp = require('mkdirp')
var fs = require('fs')
var Paper = require('./paper.js')

inherits(Project, EventEmitter)

function Project (config, opts) {
  if (!(this instanceof Project)) return new Project(config, opts)
  var self = this

  self.dir = config.dir
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

  self.setup = function (config) {
    var configpath = path.join(self.dir, 'project.json')
    if (!exists.sync(configpath)) {
      self.created = new Date()
      fs.writeFileSync(configpath, JSON.stringify({
        name: config.name,
        created: self.created.toISOString()
      }))
      self.name = config.name
    } else {
      var cfg = require(configpath)
      self.name = cfg.name
      self.created = new Date(cfg.created)
    }
    self.getSize(function () {
      // noop
    })
  }

  self.setup(config)

  self.put = function (paper, cb) {
    self.db.put(paper.getId(), paper, function (err) {
      self.changed = true
      cb(err)
    })
  }

  self.putBatch = function (papers, cb) {
    var commands = papers.map(function (paper) {
      var doc = {
        type: 'put',
        key: paper.getId(),
        value: paper.serialize()
      }
      console.log(doc)
      return doc
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

  self.getAll = function (cb) {
    var papers = []
    self.db.createReadStream({})
      .on('data', function (paper) {
        papers.push(Paper({ document: paper.value }, opts))
      })
      .on('error', function (err) {
        cb(err)
      })
      .on('end', function () {
        cb(papers)
      })
  }

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
