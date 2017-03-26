const filter = require('lodash/filter')
const cloneDeep = require('lodash/cloneDeep')

module.exports = (state, data, send, done) => {
  const update = cloneDeep(state.currentsearch || {})

  update.tags = filter(state.currentsearch.tags, (t) => {
    return !(t === data.tag)
  })

  send('search_update', update, done)
}
