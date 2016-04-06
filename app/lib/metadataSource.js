var datManager = require('dat-manager')()

function MetadataSource(source, datadir) {
  if (!(this instanceof MetadataSource)) return new MetadataSource(source)

  Object.assign(this, source)
  this.datadir = datadir
}

MetadataSource.prototype.download = function(cb) {
  var opts = { location: datadir }

  datManager.start(this.datHash, opts, (err, dat) => {
    cb(err, this)
  })
}

module.exports = MetadataSource
