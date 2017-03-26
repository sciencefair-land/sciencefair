const datasource = require('../lib/getdatasource')

module.exports = (state, data, send, done) => {
  datasource.del(data.key)
  done()
}
