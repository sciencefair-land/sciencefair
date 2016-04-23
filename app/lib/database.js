var yuno = require('yunodb')
var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')
var _ = require('lodash')

inherits(DB, EventEmitter)

function DB (datasource) {
  if (!(this instanceof DB)) return new DB(datasource)
  console.log('loading database at', datasource.dbPath())

  var self = this

  var opts = _.merge(datasource.dbOpts(), {
    location: datasource.dbPath()
  })

  yuno(opts, function (err, db) {
    if (err) throw err

    self.db = db

    // if (datasource.snapshotPath()) {
    //   self.loadSnapshot(datasource.snapshotPath(), function() {
    //     self.emit('ready')
    //   })
    // } else {
    self.emit('ready')
    // }
  })
}

DB.prototype.loadSnapshot = function (snapshot, cb) {
  this.index.replicate(fs.createReadStream(snapshot), cb)
  // TODO put something in place to show this has finished successfully
  // and prevent redownloading
}

DB.prototype.search = function(query, opts, cb) {
  return this.db.search(query, opts, cb)
}

module.exports = DB
