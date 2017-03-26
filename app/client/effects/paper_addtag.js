const cloneDeep = require('lodash/cloneDeep')
const uniq = require('lodash/uniq')

module.exports = (state, data, send, done) => {
  const alldone = require('../lib/alldone')(2, done)


  const newpapers = state.selection.list.map(paper => {
    if ((paper.tags || []).length === 0) paper.download(() => {})
    paper.tags = uniq((paper.tags || []).concat([data.tag]))
    return paper
  })

  send('result_replace', {
    key: newpapers.map(p => p.key),
    paper: newpapers
  }, alldone)

  send('collection_updatepaper', newpapers, alldone)
}
