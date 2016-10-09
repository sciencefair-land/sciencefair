const cloneDeep = require('lodash/cloneDeep')

module.exports = (datasource, state, send, done) => {
  const update = cloneDeep(
    state.datasources
  ).map(
    ds => {
      if (ds.key === datasource.key) {
        ds.active = !datasource.active
      }
      return ds
    }
  )

  send('datasources_update', update, done)
}
