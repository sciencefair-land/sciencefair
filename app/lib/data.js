var dataSources = require('../data_sources.json')
var Manager = require('dat-manager')

var dataPath = require('path').resolve('data')
var manager = Manager()

var datOpts = function(source) {
  return { location: path.join(dataPath, source.dir) }
}

module.exports = function(testing, cb) {
  console.log(dataSources)
  var filtered = dataSources.filter((source) => {
    return testing ? source.testData : !(source.testData)
  })

  filtered.forEach((source) => {
    manager.start(source.datHash, datOpts(source), (err, dat) => {
      cb(err, source)
    })
  })
}
