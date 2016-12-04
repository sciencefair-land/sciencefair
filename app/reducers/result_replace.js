const cloneDeep = require('lodash/cloneDeep')
const isArray = require('lodash/isArray')

module.exports = (data, state) => {
  const results = cloneDeep(state.results)
  const resultkeys = results.map(r => r.key)

  const keys = isArray(data.key) ? data.key : [data.key]
  const indices = keys.map((key) => resultkeys.indexOf(key))
  const papers = isArray(data.paper) ? data.paper : [data.paper]

  for (let i in indices) {
    let idx = indices[i]
    let paper = papers[i]
    results[idx] = paper
  }

  return { results: results }
}
