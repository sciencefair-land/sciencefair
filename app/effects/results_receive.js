const uniqBy = require('lodash/uniqBy')
const sortBy = require('lodash/sortBy')
const paper = require('../lib/getpaper')

module.exports = (state, data, send, done) => {
  const papers = data.hits.map(paper)
  papers.forEach(p => p.filesPresent(() => {}))

  const results = uniqBy(
    state.results.concat(papers),
    result => result.key
  )

  send('results_replace', sortBy(results, r => r.score), done)
}
