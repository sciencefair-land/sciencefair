const cloneDeep = require('lodash/cloneDeep')

module.exports = (state, data, send, done) => {
  const update = cloneDeep(state.currentsearch || {})

  update.tagquery = null
  update.striptagquery = false

  send('search_trickle', update, done)
}
