const cloneDeep = require('lodash/cloneDeep')

module.exports = (data, state) => {
  const results = cloneDeep(state.results)
  results[data.index] = data.paper
  return { results: results }
}
