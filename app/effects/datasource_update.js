const cloneDeep = require('lodash/cloneDeep')

module.exports = (source, state, send, done) => {
  const update = cloneDeep(state.datasources.list)

  const target = update.find(ds => ds.key === source.key)

  if (target) Object.assign(target, source)

  send('datasources_update', update, done)
}
