const cloneDeep = require('lodash/cloneDeep')

module.exports = (data, state, send, done) => {
  const tags = cloneDeep(state.tags.tags) || {}

  tags[data.tag] = [data.paper]
  send('tags_replace', tags, done)
}
