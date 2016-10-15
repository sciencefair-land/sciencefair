const cloneDeep = require('lodash/cloneDeep')

module.exports = (data, state, send, done) => {
  const update = cloneDeep(state.errors)
  if (update[data]) delete update[data]

  send('errors_set', update, done)
}
