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

  datasource.fetch(data.key, (err, source) => {
    if (err) return done(err)

    source.toggleActive()
    if (source.stats.get('active').value()) {
      source.syncMetadata(err => {
        if (err) done(err)
        send('datasources_update', update, done)
      })
    } else send('datasources_update', update, done)
  })
}
