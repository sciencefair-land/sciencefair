const cloneDeep = require('lodash/cloneDeep')
const uniq = require('lodash/uniq')

module.exports = (data, state, send, done) => {
  const alldone = require('../../lib/alldone')(2, done)
  const paper = state.results[data.paper]
  const newPaper = cloneDeep(paper)

  newPaper.document.tags = uniq(paper.document.tags.concat([data.tag]))

  send('result_replace', { index: data.paper, paper: newPaper }, alldone)
  send('collection_updatepaper', newPaper, alldone)
}
