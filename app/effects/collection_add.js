const datasource = require('../../lib/datasource')
const streamify = require('stream-array')
const pump = require('pump')

module.exports = (data, state, send, done) => {
  datasource.fetch(data.source, (err, ds) => {
    if (err) return done(err)
    if (!ds) return done(new Error('could not find datssource for paper'))

    const alldone = require('../../lib/alldone')(2, done)

    // add metadata to the local collection
    pump(streamify([data.document]), state.collection.add(alldone))

    // download all associated files
    datasource.download(data, alldone)
  })
}
