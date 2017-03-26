const cloneDeep = require('lodash/cloneDeep')

module.exports = (state, data, send, done) => {
  const update = cloneDeep(state.datasources.list)

  const target = update.find(ds => ds.key === data.key)

  if (target) Object.assign(target, data)

  send('datasources_update', update, done)
}
