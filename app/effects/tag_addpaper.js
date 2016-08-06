const uniq = require('lodash/uniq')

module.exports = (data, state, send, done) => {
  const papers = state.tags.tags[data.tag]
  const newPapers = uniq(papers.concat([data.paper]))

  send('tag_replace', { tag: data.tag, papers: newPapers }, done)
}
