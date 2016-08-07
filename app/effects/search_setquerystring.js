module.exports = (data, state, send, done) => {
  const alldone = require('../../lib/alldone')(2, done)

  const oldsearch = state.currentsearch || {}

  var update = {
    query: data.query,
    tags: oldsearch.tags
  }

  send('search_update', update, alldone)
  send(`autocomplete_${tagmode(data.query) ? 'show' : 'hide'}`, null, alldone)
}

function tagmode (str) {
  return /#/.test(str)
}
