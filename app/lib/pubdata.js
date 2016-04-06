var _ = require('lodash')
var metadataSource = require('./metadataSource.js')
var fulltextSource = require('./fulltextSource.js')

function PubData(datadir, testing) {
  if (!(this instanceof PubData)) return new PubData(datadir, testing)

  this.testing = testing
  this.datadir = datadir
  this.sources = require('../data_sources.json')
  console.log(this.sources)
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
