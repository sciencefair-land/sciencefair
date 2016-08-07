const uniq = require('lodash/uniq')

module.exports = (data, state, send, done) => {
  const alldone = require('../../lib/alldone')(2, done)
  const oldsearch = state.currentsearch || {}

  var update = {
    query: oldsearch.query,
    tags: uniq((oldsearch.tags || []).concat([data.tag]))
  }

  send('search_striptagquery', null, alldone)

  send('results_clear', null, (err) => {
    if (err) return done(err)
    send('search_update', update, alldone)
  })
}
