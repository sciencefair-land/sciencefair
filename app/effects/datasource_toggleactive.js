const cloneDeep = require('lodash/cloneDeep')

module.exports = (data, state, send, done) => {
  const entry = state.datasources.list.find(ds => ds.key === data.key)

  if (!entry) {
    return done(new Error('no datasource in state for', entry.name))
  }

  const update = cloneDeep(
    state.datasources.list
  ).map(
    ds => {
      if (ds.key === data.key) {
        ds.active = !data.active
      }
      return ds
    }
  )

  send('datasources_update', update, done)
}
