const cloneDeep = require('lodash/cloneDeep')

module.exports = (data, state, send, done) => {
  const alldone = require('../../lib/alldone')(2, done)
  const paper = state.results[data.paper]
  const newPaper = cloneDeep(paper)

  const tags = paper.document.tags
  const removeidx = tags.indexOf(data.tag)
  const newTags = (removeidx > -1) ? tags.splice(removeidx, 1) : tags

  newPaper.document.tags = newTags

  send('result_replace', { index: data.paper, paper: newPaper }, alldone)
  send('tag_removepaper', {
    tag: data.tag,
    paper: paper.document.identifier[0].id
  }, alldone)
}
