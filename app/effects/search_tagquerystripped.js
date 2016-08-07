const cloneDeep = require('lodash/cloneDeep')

module.exports = (data, state, send, done) => {
  const update = cloneDeep(state.currentsearch || {})

  update.tagquery = null
  update.striptagquery = false

  send('search_trickle', update, done)
}
