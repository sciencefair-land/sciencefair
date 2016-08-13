const cloneDeep = require('lodash/cloneDeep')
const isArray = require('lodash/isArray')

module.exports = (data, state) => {
  const results = cloneDeep(state.results)
  const resultsids = results.map((result) => {
    return result.document.identifier[0].id
  })

  const ids = isArray(data.id) ? data.id : [data.id]
  const indices = ids.map((id) => resultsids.indexOf(id))
  const papers = isArray(data.paper) ? data.paper : [data.paper]

  for (var i in indices) {
    const idx = indices[i]
    const paper = papers[i]
    results[idx] = paper
  }

  return { results: results }
}
