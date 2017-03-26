const cloneDeep = require('lodash/cloneDeep')

module.exports = (data, state, send, done) => {
  const tags = cloneDeep(state.tags.tags) || {}
  if (data.papers.length > 0) {
    tags[data.tag] = data.papers.map(p => p.key)
  } else {
    delete tags[data.tag]
  }
  send('tags_replace', tags, done)
}
