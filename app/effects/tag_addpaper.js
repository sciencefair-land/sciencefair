const uniq = require('lodash/uniq')
const cloneDeep = require('lodash/cloneDeep')

module.exports = (data, state, send, done) => {
  const papers = cloneDeep(state.tags.tags[data.tag]) || []
  const newPapers = uniq(papers.concat(state.selection.list.map(p => p.key)))

  send('tag_replace', { tag: data.tag, papers: newPapers }, done)
}
