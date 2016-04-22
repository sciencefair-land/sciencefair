var _ = require('lodash')
var path = require('path')
var fs = require('fs')
var exists = require('path-exists')
var mkdirp = require('mkdirp')
var exec = require('sync-exec')

var metadataSource = require('./metadataSource.js')
var fulltextSource = require('./fulltextSource.js')

function installTestData(datadir) {
  // TODO make this less hacky
  var file = path.join('eupmc_lite_10k', 'eupmc_lite_10k.tar.bz2')
  var src = path.join(path.resolve('data'), file)
  var dest = path.join(datadir, file)

  if (exists.sync(dest)) return

  console.log('installing included test data to', dest)
  mkdirp(path.join(datadir, 'eupmc_lite_10k'))
  fs.writeFileSync(dest, fs.readFileSync(src))
  exec(`cd ${datadir}/eupmc_lite_10k && tar xf eupmc_lite_10k.tar.bz2`)
}

function PubData(datadir, testing) {
  if (!(this instanceof PubData)) return new PubData(datadir, testing)

  this.testing = testing
  this.datadir = datadir
  this.sources = require('../data_sources.json')

  if (testing) installTestData(datadir)
}

PubData.prototype.getMetadataSource = function() {
  var self = this
  var result = this.getSource({ type: 'metadata' }).map(function(source) {
    return metadataSource(source, self.datadir)
  })
  console.log(`found ${result.length} metadata sources`)
  return result
}

PubData.prototype.getFulltextSource = function() {
  var self = this
  var result = this.getSource({ type: 'fulltext' }).map(function(source) {
    return fulltextSource(source, self.datadir)
  })
  console.log(`found ${result.length} fulltext sources`)
  return result
}

PubData.prototype.getSource = function(filter) {
  return _.filter(this.sources, _.extend(filter, { testData: this.testing }))
}

module.exports = PubData
