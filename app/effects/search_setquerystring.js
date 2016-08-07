module.exports = (data, state, send, done) => {
  const alldone = require('../../lib/alldone')(2, done)

  const oldsearch = state.currentsearch || {}

  const queryparts = data.query.split('#')
  const newquery = queryparts[0]
  const tagquery = queryparts[1]

  var update = {
    query: newquery,
    tags: oldsearch.tags,
    tagquery: tagquery
  }

  send('results_clear', null, (err) => {
    if (err) return done(err)
    send('search_update', update, alldone)
  })
  send(`autocomplete_${tagquery ? 'show' : 'hide'}`, null, alldone)
}
