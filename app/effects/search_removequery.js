const isString = require('lodash/isString')
const difference = require('lodash/difference')
const replace = require('lodash/replace')

module.exports = (data, state, send, done) => {
  const oldQuery = state.currentquery || {}
  var update = data.query

  if (data.query && isString(data.query)) {
    update = { query: data.query, tags: [] }
  }

  const oldtags = (oldQuery.tags || [])
  const removetags = (update.tags || [])
  const newtags = difference(oldtags, removetags)

  const oldquery = (oldQuery.query || '')
  const removequery = (update.query || '')
  const newquery = replace(oldquery, removequery, '')

  send('search_setquery', {
    newquery: {
      tags: newtags,
      query: newquery
    }
  }, done)
}
