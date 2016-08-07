const uniqBy = require('lodash/uniqBy')

module.exports = (data, state) => {
  const results = uniqBy(state.results.concat(data.hits), (result) => {
    return result.document.identifier[0].id
  })
  // TODO: intelligent merging of results based on TF-IDF score
  return {
    results: results
  }
}
