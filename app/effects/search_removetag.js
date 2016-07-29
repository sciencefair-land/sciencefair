const filter = require('lodash/filter')

module.exports = (data, state, send, done) => {
  const oldsearch = state.currentsearch || {}

  const update = {
    query: oldsearch.query,
    tags: filter(oldsearch.tags, (t) => {
      return !(t === data.tag)
    })
  }

  send('search_update', update, done)
}
