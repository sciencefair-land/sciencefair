var yuno = require('yunodb')
var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')
var _ = require('lodash')

inherits(DB, EventEmitter)

function DB (datasource) {
  if (!(this instanceof DB)) return new DB(datasource)
  console.log('loading database at', datasource.dbPath())

  var self = this
  this.datasource = datasource

  var opts = _.merge(datasource.dbOpts(), {
    location: datasource.dbPath()
  })

  yuno(opts, function (err, db) {
    if (err) throw err

    self.db = db

    self.emit('ready')
  })
}

DB.prototype.search = function (query, opts, cb) {
  return this.db.search(query, opts, cb)
}

module.exports = DB
