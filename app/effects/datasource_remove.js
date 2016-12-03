const datasource = require('../../lib/getdatasource')

module.exports = (data, state, send, done) => {
  datasource.del(data.key)
  done()
}
