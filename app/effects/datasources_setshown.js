const cloneDeep = require('lodash/cloneDeep')

module.exports = (data, state, send, done) => {
  const update = cloneDeep(state.datasources)
  update.shown = data

  send('datasources_update', update, done)
}
