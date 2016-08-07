module.exports = (data, state, send, done) => {
  const alldone = require('../../lib/alldone')(2, done)

  send('results_clear', 'collection', alldone)
  send('search_trickle', {
    query: '',
    tags: [],
    tagquery: null,
    striptagquery: false
  }, alldone)
}
