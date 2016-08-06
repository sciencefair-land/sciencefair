module.exports = (data, state, send, done) => {
  const alldone = require('../../lib/alldone')(2, done)

  send('results_none', 'collection', alldone)
  send('search_trickle', { query: '', tags: [] }, alldone)
}
