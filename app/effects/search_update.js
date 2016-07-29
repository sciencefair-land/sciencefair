const uniq = require('lodash/uniq')
const after = require('lodash/after')

module.exports = (data, state, send, done) => {
  // query is an object containing:
  // `query` (String): text query
  // `tags` (Array): an array of 0 or more tags to filter by
  const newquery = data

  const alldone = after(2, done)

  if (newquery.tags && newquery.tags.length) {
    send('search_collection', {
      query: newquery.query,
      tags: uniq(newquery.tags)
    }, alldone)
  } else {
    send('search_datasources', newquery, alldone)
  }

  send('search_trickle', newquery, alldone)
}
