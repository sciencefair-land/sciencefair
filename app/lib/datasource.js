var fs = require('fs')
var path = require('fs')

var mkdirp = require('mkdirp').sync
var yuno = require('yunodb')
var C = require('../constants')

const datasource = (dir) {
  const dbpath = path.join(dir, 'index')
  mkdirp(dbpath)

  var db = null

  function sync (cb) {
    // TODO: hyperdrive sync
  }

  function search (query, options, cb) {

  }
}

module.exports = {
  load:
  }
}
