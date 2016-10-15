const uniq = require('lodash/uniq')
const cloneDeep = require('lodash/cloneDeep')

module.exports = (data, state, send, done) => {
  // query is an object containing:
  // `query` (String): text query
  // `tags` (Array): an array of 0 or more tags to filter by

  // if query is '*' or we have tags, don't search datasources
  const searchdatasources =
    !(data.query.trim() === '*') &&
    !(data.tags && data.tags.length)

  const alldone = require('../../lib/alldone')(searchdatasources ? 3 : 2, done)

  const newsearch = cloneDeep(state.currentsearch)
  newsearch.query = data.query
  newsearch.tags = uniq(data.tags)
  newsearch.tagquery = data.tagquery
  newsearch.striptagquery = data.striptagquery || false

  send('search_collection', newsearch, alldone)

  if (searchdatasources) send('search_datasources', newsearch, alldone)
  else console.log('not searching datasources')

  send('search_trickle', newsearch, alldone)
}
