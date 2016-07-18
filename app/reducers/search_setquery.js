const isString = require('lodash/isString')
const uniq = require('lodash/uniq')

module.exports = (data, state) => {
  // query is an object containing:
  // `query` (String): text query
  // `tags` (Array): an array of 0 or more tags to filter by
  const newquery = data.newquery
  newquery.tags = uniq(newquery.tags)

  return {
    currentquery: isString(newquery) ? { query: newquery } : newquery
  }
}
