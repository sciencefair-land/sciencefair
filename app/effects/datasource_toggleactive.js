const cloneDeep = require('lodash/cloneDeep')
const after = require('lodash/after')

module.exports = (data, state, send, done) => {
  const alldone = after(2, done)

  // sync metadata to index
  const entry = state.datasources.find(ds => ds.key === data.key)

  if (!data.active) {
    if (entry.source) {
      entry.source.syncMetadata(alldone)
    } else {
      console.log('ERROR: no datasource loaded for', entry.name)
      alldone(new Error('no datasource in state for', entry.name))
    }
  } else {
    alldone()
  }

  // update state
  const update = cloneDeep(
    state.datasources
  ).map(
    ds => {
      if (ds.key === data.key) {
        ds.active = !data.active
      }
      return ds
    }
  )

  send('datasources_update', update, alldone)
}
