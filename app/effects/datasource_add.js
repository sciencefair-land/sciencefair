const cloneDeep = require('lodash/cloneDeep')
const datasource = require('../../lib/datasources')

module.exports = (data, state, send, done) => {
  const update = cloneDeep(state.datasources.list)
  update.push(data)

  const load = err => {
    if (err) done(err)

    datasource(data.key).connect(done)
  }

  send('datasources_update', update, load)
}
