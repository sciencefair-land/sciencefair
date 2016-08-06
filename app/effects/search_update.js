const uniq = require('lodash/uniq')

module.exports = (data, state, send, done) => {
  // query is an object containing:
  // `query` (String): text query
  // `tags` (Array): an array of 0 or more tags to filter by
  const newquery = data

  // if we have tags, don't search datasources
  const searchdatasources = !(newquery.tags && newquery.tags.length)

  const alldone = require('../../lib/alldone')(searchdatasources ? 3 : 2, done)

  send('search_collection', {
    query: newquery.query,
    tags: uniq(newquery.tags)
  }, alldone)

  if (searchdatasources) send('search_datasources', newquery, alldone)

  send('search_trickle', newquery, alldone)
}
