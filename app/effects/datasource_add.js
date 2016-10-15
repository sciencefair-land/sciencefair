const datasource = require('../../lib/datasource')

module.exports = (data, state, send, done) => {
  datasource(data.key).connect(done)
}
