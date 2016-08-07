const uniqBy = require('lodash/uniqBy')

module.exports = (data, state) => {
  var selected = null
  if (state.selectedpaper) {
    state.results[state.selectedpaper]
  }

  const results = uniqBy(state.results.concat(data.hits), (result) => {
    return result.document.identifier[0].id
  })

  const update = {
    results: results
  }

  if (selected) {
    update.selectedpaper = results.indexOf(selected)
  }

  // TODO: intelligent merging of results based on TF-IDF score
  return update
}
