var exists = require('path-exists').sync
var path = require('path')
var Download = require('download')

function MetadataSource (source, datadir) {
  if (!(this instanceof MetadataSource)) {
    return new MetadataSource(source, datadir)
  }

  Object.assign(this, source)
  this.datadir = datadir
}

MetadataSource.prototype.ensure = function (cb) {
  if (!exists(this.dbPath()) || !exists(this.snapshotPath())) {
    this.download(cb)
  } else {
    cb()
  }
}

MetadataSource.prototype.download = function (cb) {
  if (exists(this.snapshotPath())) return cb()
  console.log('downloading', this.name, 'from', this.link(), 'to', this.location())
  var dl = new Download({ extract: false, mode: '755' })
  dl.get(this.link())
    .dest(this.location())
    .run(cb)
}

MetadataSource.prototype.link = function () {
  return this.links[0].link
}

MetadataSource.prototype.location = function () {
  return path.join(this.datadir, this.dir)
}

MetadataSource.prototype.dbPath = function () {
  return path.join(this.location(), this.filename)
}

MetadataSource.prototype.snapshotPath = function () {
  return this.snapshot ? path.join(this.location(), this.snapshot) : null
}

module.exports = MetadataSource
