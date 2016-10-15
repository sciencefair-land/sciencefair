const datasource = require('../../lib/datasource')

module.exports = (data, state, send, done) => {
  if (data.key.length !== 64) {
    return done(new Error('datasource keys must be 32 characters long'))
  }
  datasource.fetch(data.key, (err, ds) => {
    if (err) return done(err)

    ds.connect(done)
  })
}
