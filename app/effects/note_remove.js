const cloneDeep = require('lodash/cloneDeep')

module.exports = (data, state, send, done) => {
  const update = cloneDeep(state.notes)
  if (update[data]) delete update[data]

  send('notes_set', update, done)
}
