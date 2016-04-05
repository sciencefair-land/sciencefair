var datManager = require('dat-manager')()
var datapath = require('path').resolve('data')

function MetadataSource(source) {
  if (!(this instanceof MetadataSource)) return new MetadataSource(source)

  Object.assign(this, source)
}

MetadataSource.prototype.download = function(cb) {
  var opts = { location: path.join(datapath, this.dir) }

  datManager.start(this.datHash, opts, (err, dat) => {
    cb(err, this)
  })
}

module.exports = MetadataSource
