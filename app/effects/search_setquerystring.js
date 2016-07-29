module.exports = (data, state, send, done) => {
  const oldsearch = state.currentsearch || {}

  var update = {
    query: data.query,
    tags: oldsearch.tags
  }

  send('search_update', update, done)
}
