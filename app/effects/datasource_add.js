const datasource = require('../lib/getdatasource')

module.exports = (data, state, send, done) => {
  console.log('DATASOURCE ADD', data)
  if (data.key.length !== 64) {
    return done(new Error(`datasource keys must be 64 characters long, but ${data.key} has length ${data.key.length}`))
  }
  datasource.fetch(data, (err, ds) => {
    if (err) return done(err)
    ds.toggleActive()
    ds.connect(err => done(err, ds))
  })
}
