
var path = require('path')

function MetadataSource(source, datadir) {
  if (!(this instanceof MetadataSource)) {
    return new MetadataSource(source, datadir)
  }

  Object.assign(this, source)
  this.datadir = datadir
}

MetadataSource.prototype.download = function(cb) {
  var opts = { location: path.join(this.datadir, this.dir) }

  require('dat-manager')(opts).start(this.datHash, opts, (err, dat) => {
    cb(err, this)
  })
}

module.exports = MetadataSource
