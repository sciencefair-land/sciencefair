var searchIndex = require('search-index')
var _ = require('lodash')
var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')

inherits(DB, EventEmitter)

function DB (datasource) {
  if (!(this instanceof DB)) return new DB(datasource)

  var self = this

  var opts = {
    deletable: false,
    fieldedSearch: false,
    indexPath: datasource.dbPath()
  }

  searchIndex(opts, function (err, si) {
    self.index = si

    if (datasource.snapshotPath()) {
      self.loadSnapshot(datasource.snapshotPath(), function() {
        self.emit('ready')
      })
    } else {
      self.emit('ready')
    }
  })
}

DB.prototype.loadSnapshot = function (snapshot, cb) {
  this.index.replicate(fs.createReadStream(snapshot), cb)
  // TODO put something in place to show this has finished successfully
  // and prevent redownloading
}

DB.prototype.search = function(query, opts, db) {
  return new Query(query, opts, this)
}

inherits(Query, EventEmitter)

function Query (query, opts, db) {
  if (!(this instanceof Query)) return new Query(query, opts, db)

  if (!opts) {
    opts = {
      offset: 0,
      pageSize: 30
    }
  }

  if (_.isString(query)) {
    query = {
      AND: { '*': query.split() }
    }
  }

  this.db = db

  this.query = query
  this.query.offset = opts.offset
  this.query.pageSize = opts.pageSize
}

Query.prototype.nextPage = function () {
  var self = this

  this.db.index.search(this.query, function(err, results) {
    if (err) self.emit('error', err)
    else self.emit('results', results)
  })

  this.query.offset += this.query.pageSize
}

Query.prototype.equals = function (other) {
  return (other instanceof Query) && this.query === other.query
}

module.exports = DB
