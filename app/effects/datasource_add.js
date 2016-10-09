const cloneDeep = require('lodash/cloneDeep')

module.exports = (datasource, state, send, done) => {
  const update = cloneDeep(state.datasources)
  update.push(datasource)

  const load = err => {
    if (err) done(err)

    send('datasource_load', datasource, done)
  }

  send('datasources_update', update, load)
}
