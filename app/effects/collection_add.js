const datasource = require('../../lib/getdatasource')
const streamify = require('stream-array')
const pump = require('pump')

module.exports = (paper, state, send, done) => {
  const alldone = require('../../lib/alldone')(2, done)

  // add metadata to the local collection
  data.document.source = data.source
  pump(streamify([data.document]), state.collection.add(alldone))

  // download all associated files
  paper.download(alldone)
}
