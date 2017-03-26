const cloneDeep = require('lodash/cloneDeep')

module.exports = (state, data, send, done) => {
  const update = cloneDeep(state.notes)
  if (update[data]) delete update[data]

  send('notes_set', update, done)
}
