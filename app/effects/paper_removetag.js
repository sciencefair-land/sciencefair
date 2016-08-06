const cloneDeep = require('lodash/cloneDeep')
const uniq = require('lodash/uniq')

module.exports = (data, state, send, done) => {
  const paper = state.results[data.paper]
  const newPaper = cloneDeep(paper)

  newPaper.tags = uniq(paper.tags.concat([data.tag]))

  send('result_replace', { index: data.paper, paper: newPaper }, (err) => {
    if (err) console.log(err)
  })
  done()
}
