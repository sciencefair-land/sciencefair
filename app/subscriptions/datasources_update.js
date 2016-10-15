// this subscription updates every datasource's data at 1 second intervals
// it's necessary to maintain the unidirectional data flow model
// it also allows the datasource class to know nothing about the webapp

const datasource = require('../../lib/datasource')
const update = cb => {
  const datasources = datasource.all().map(ds => ds.data())
  return cb(datasources)
}

module.exports = (send, done) => {
  setInterval(
    () => update(
      datasources => send(
        'datasources_setlist', datasources,
        err => { if (err) console.error('error updating datasources', err) }
      )
    ),
    1000
  )
}
