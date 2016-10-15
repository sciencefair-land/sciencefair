const cloneDeep = require('lodash/cloneDeep')
const datasource = require('../../lib/datasource')

module.exports = (data, state, send, done) => {
  const entry = state.datasources.list.find(ds => ds.key === data.key)

  if (!entry) {
    return done(new Error('no datasource in state for', entry.name))
  }

  const update = cloneDeep(state.datasources)

  const ds = update.list.find(ds => ds.key === data.key)
  ds.active = !data.active

  datasource.fetch(data.key, (err, ds) => {
    if (err) done(err)

    ds.active = !data.active

    send('datasources_update', update, done)
  })
}
