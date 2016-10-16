const cloneDeep = require('lodash/cloneDeep')
const uniq = require('lodash/uniq')

module.exports = (data, state, send, done) => {
  const alldone = require('../../lib/alldone')(2, done)

  const ids = state.selection.papers
  const resultsids = state.results.map((result) => {
    return result.document.identifier[0].id
  })

  const papers = ids.map((id) => {
    const idx = resultsids.indexOf(id)
    return state.results[idx]
  })

  const newPapers = papers.map((paper) => {
    const newPaper = cloneDeep(paper)
    const newTags = uniq((paper.document.tags || []).concat([data.tag]))
    newPaper.document.tags = newTags
    return newPaper
  })

  send('result_replace', {
    id: ids,
    paper: newPapers
  }, alldone)

  send('collection_updatepaper', newPapers, alldone)
}
