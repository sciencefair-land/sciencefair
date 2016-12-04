const cloneDeep = require('lodash/cloneDeep')

module.exports = (data, state, send, done) => {
  const alldone = require('../../lib/alldone')(3, done)
  const papers = state.selection.list

  const newPapers = papers.map(paper => {
    const tags = paper.document.tags
    const removeidx = tags.indexOf(data.tag)
    if (removeidx > -1) tags.splice(removeidx, 1)

    paper.document.tags = tags
    return paper
  })

  send('result_replace', {
    key: state.selection.list.map(p => p.key),
    paper: newPapers
  }, alldone)
  send('collection_updatepaper', newPapers, alldone)
  send('tag_removepaper', {
    tag: data.tag,
    paper: state.selection.list
  }, alldone)
}
