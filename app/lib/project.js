var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var levelup = require('levelup')
var path = require('path')
var exists = require('path-exists')

inherits(Project, EventEmitter)

function Project (opts) {
  if (!(this instanceof Project)) return new Project(opts)
  var self = this

  self.dir = opts.dir
  mkdirp(self.dir)

  setup(opts)

  self.dbdir = path.join(self.dir, 'leveldb')
  self.db = levelup(self.dbdir, { valueEncoding: 'json' })

  self.put = function (paper, cb) {
    self.db.put(paper.getId(), paper, cb)
  }

  self.putBatch = function(papers, cb) {
    self.db.batch(papers.map(function(paper) {
      return {
        type: 'put',
        key: paper.getId(),
        paper: paper.serialize()
      }
    }), cb)
  }

  self.get = self.db.get

  self.getBatch = function (keys, cb) {
    keys.forEach(function(key) {
      self.get(key, cb)
    })
  }

  self.createReadStream = self.db.createReadStream

  self.del = self.db.del

  self.delBatch = function (keys, cb) {
    self.db.batch(keys.map(function(key) {
      return {
        type: 'del',
        key: key
      }
    }), cb)
  }

  self.forEach = function(fn, cb) {
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

  function setup(opts) {
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
  }

}

module.exports = Project
