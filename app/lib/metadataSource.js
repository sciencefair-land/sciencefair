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
  console.log('ensuring database exists at', this.dbPath())
  if (!(this.dbExists()) && !(this.snapshotExists())) {
    console.log('neither database nor snapshot exist - downloading')
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

MetadataSource.prototype.getFilename = function () {
  return this.filename || this.file.extracted
}

MetadataSource.prototype.link = function () {
  return this.links[0].link
}

MetadataSource.prototype.location = function () {
  return path.join(this.datadir, this.dir)
}

MetadataSource.prototype.dbPath = function () {
  return path.join(this.location(), this.getFilename())
}

MetadataSource.prototype.snapshotPath = function () {
  return this.snapshot ? path.join(this.location(), this.snapshot) : null
}

MetadataSource.prototype.dbExists = function () {
  return this.dbPath() && exists(this.dbPath())
}

MetadataSource.prototype.snapshotExists = function () {
  return this.snapshotPath() && exist(this.snapshotPath())
}

MetadataSource.prototype.dbOpts = function() {
  return this.options || {}
}

module.exports = MetadataSource
