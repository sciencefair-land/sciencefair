const isString = require('lodash/isString')
const uniq = require('lodash/uniq')

module.exports = (data, state, send, done) => {
  // query is an object containing:
  // `query` (String): text query
  // `tags` (Array): an array of 0 or more tags to filter by
  const newquery = data.newquery

  if (!isString(newquery) && newquery.tags && newquery.tags.length) {
    send('search_collection', {
      query: newquery.query,
      tags: uniq(newquery.tags)
    }, done)
  } else {
    const query = isString(newquery) ? newquery : newquery.query
    send('search_datasources', query, done)
  }
}
