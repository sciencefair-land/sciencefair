const cloneDeep = require('lodash/cloneDeep')

module.exports = (state, data, send, done) => {
  const update = cloneDeep(state.datasources)
  update.loaded = true

  send('datasources_update', update, done)
}
