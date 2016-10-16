// this subscription updates every datasource's data at 1 second intervals
// it's necessary to maintain the unidirectional data flow model
// it also allows the datasource class to know nothing about the webapp

const datasource = require('../../lib/datasource')
const update = () => datasource.all().map(ds => ds.data())
const err = err => { if (err) console.error('error updating datasources', err) }

module.exports = (send, done) => {
  setInterval(() => send('datasources_setlist', update(), err), 1000)
}
