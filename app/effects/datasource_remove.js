const datasource = require('../../lib/datasource')

module.exports = (data, state, send, done) => {
  datasource.del(data.key)
  done()
}
