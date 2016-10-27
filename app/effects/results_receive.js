const uniqBy = require('lodash/uniqBy')
const sortBy = require('lodash/sortBy')

module.exports = (data, state, send, done) => {
  const results = uniqBy(
    state.results.concat(data.hits),
    result => result.document.identifier[0].id
  )

  send('results_replace', sortBy(results, r => r.score), done)
}
