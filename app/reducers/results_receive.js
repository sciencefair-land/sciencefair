const uniqBy = require('lodash/uniqBy')
const sortBy = require('lodash/sortBy')

module.exports = (data, state) => {
  var selected = null
  if (state.selectedpaper) {
    selected = state.results[state.selectedpaper]
  }

  const results = uniqBy(
    state.results.concat(data.hits),
    result => result.document.identifier[0].id
  )

  const update = {
    results: sortBy(results, r => r.score)
  }

  if (selected) {
    update.selectedpaper = results.indexOf(selected)
  }

  // TODO: intelligent merging of results based on TF-IDF score
  return update
}
