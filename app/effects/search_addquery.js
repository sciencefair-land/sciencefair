const isString = require('lodash/isString')

module.exports = (data, state, send, done) => {
  const oldQuery = state.currentquery || {}
  var update = data.query

  if (data.query && isString(data.query)) {
    update = { query: data.query, tags: [] }
  }

  const newtags = (oldQuery.tags || [])
    .concat((update.tags || []))

  const newquery = [(oldQuery.query || '') + (update.query || '')]
    .join(' ')
    .trim()

  send('search_setquery', {
    newquery: {
      tags: newtags,
      query: newquery
    }
  }, done)
}
