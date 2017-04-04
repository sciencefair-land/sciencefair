const cloneDeep = require('lodash/cloneDeep')

module.exports = (state, data, send, done) => {
  const update = cloneDeep(state.datasources)
  update.shown = data

  send('datasources_update', update, done)
}
