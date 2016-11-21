const datasource = require('../../lib/datasource')

module.exports = (data, state, send, done) => {
  if (data.key.length !== 64) {
    return done(new Error(`datasource keys must be 64 characters long, but ${data.key} has length ${data.key.length}`))
  }
  console.log('adding datasource with key', data.key)
  datasource.fetch(data.key, (err, ds) => {
    if (err) return done(err)

    ds.connect(done)
  })
}
