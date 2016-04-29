var path = require('path')
var exists = require('path-exists').sync

function MetadataSource(source, datadir) {
  if (!(this instanceof MetadataSource)) {
    return new MetadataSource(source, datadir)
  }

  Object.assign(this, source)
  this.datadir = datadir
}

MetadataSource.prototype.download = function(cb) {
  var self = this
  var opts = { location: path.join(this.datadir, this.dir) }

  if (exists(path.join(opts.location, this.filename))) {
    console.log('metadata source file exists - skipping download')
    cb(null, self)
  }

  require('dat-manager')(opts).start(this.datHash, opts, (err, dat) => {
    cb(err, self)
  })
}

module.exports = MetadataSource
