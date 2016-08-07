const cloneDeep = require('lodash/cloneDeep')

module.exports = (data, state, send, done) => {
  const alldone = require('../../lib/alldone')(3, done)
  const paper = state.results[data.paper]
  const newPaper = cloneDeep(paper)

  const tags = cloneDeep(paper.document.tags)
  const removeidx = tags.indexOf(data.tag)
  if (removeidx > -1) tags.splice(removeidx, 1)

  newPaper.document.tags = tags

  console.log('paper_removetag', newPaper)

  send('result_replace', { index: data.paper, paper: newPaper }, alldone)
  send('collection_updatepaper', newPaper, alldone)
  send('tag_removepaper', {
    tag: data.tag,
    paper: paper.document.identifier[0].id
  }, alldone)
}
