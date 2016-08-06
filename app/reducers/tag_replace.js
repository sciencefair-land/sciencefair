const cloneDeep = require('lodash/cloneDeep')

module.exports = (data, state) => {
  const tags = cloneDeep(state.tags)
  tags.tags[data.tag] = data.papers
  return { tags: tags }
}
