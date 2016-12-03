const groupBy = require('lodash/groupBy')
const datasource = require('../../lib/getdatasource')

module.exports = (data, state, send, done) => {
  const alldone = require('../../lib/alldone')(data.length + 1, done)
  data.forEach(d => d.download(alldone))
  send('tag_add', { tag: '__local' }, alldone)
}
