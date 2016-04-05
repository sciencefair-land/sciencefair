var _ = require('lodash')
var metadataSource = require('./metadataSource.js')
var fulltextSource = require('./fulltextSource.js')

function PubData(testing) {
  if (!(this instanceof PubData)) return new PubData(testing)

  this.testing = testing
  this.sources = require('../data_sources.json')
}

PubData.prototype.getMetadataSource = function() {
  var result = this.getSource({ type: 'metadata' }).map(metadataSource)
  console.log(`found ${result.length} metadata sources`)
  return result
}

PubData.prototype.getFulltextSource = function() {
  var result = this.getSource({ type: 'fulltext' }).map(fulltextSource)
  console.log(`found ${result.length} fulltext sources`)
  return result
}

PubData.prototype.getSource = function(filter) {
  console.log(this.sources)
  console.log(_.extend(filter, { testData: this.testing }))
  return _.filter(this.sources, _.extend(filter, { testData: this.testing }))
}

module.exports = PubData
