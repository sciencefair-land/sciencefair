const cloneDeep = require('lodash/cloneDeep')

module.exports = (data, state, send, done) => {
  const alldone = require('../../lib/alldone')(3, done)
  const papers = state.results.filter((result) => {
    const id = result.document.identifier[0].id
    return state.selection.papers.indexOf(id) > -1
  })

  const newPapers = papers.map((paper) => {
    const newPaper = cloneDeep(paper)

    const tags = cloneDeep(paper.document.tags)
    const removeidx = tags.indexOf(data.tag)
    if (removeidx > -1) tags.splice(removeidx, 1)

    newPaper.document.tags = tags
    return newPaper
  })

  send('result_replace', {
    id: state.selection.papers,
    paper: newPapers
  }, alldone)
  send('collection_updatepaper', newPapers, alldone)
  send('tag_removepaper', {
    tag: data.tag,
    paper: state.selection.papers
  }, alldone)
}
