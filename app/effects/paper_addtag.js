const cloneDeep = require('lodash/cloneDeep')
const uniq = require('lodash/uniq')

module.exports = (data, state, send, done) => {
  const alldone = require('../../lib/alldone')(2, done)

  const newpapers = state.selection.list.map(paper => {
    paper.tags = uniq((paper.tags || []).concat([data.tag]))
    return paper
  })

  send('result_replace', {
    id: newpapers.map(p => p.key),
    paper: newpapers
  }, alldone)

  send('collection_updatepaper', newpapers, alldone)
}
