const isArray = require('lodash/isArray')
const stream = require('stream-from-array').obj
const pumpify = require('pumpify')
const eos = require('end-of-stream')

const noop = () => {}

module.exports = (data, state, send, done) => {
  const papers = isArray(data) ? data : [data]
  const docs = stream(papers.map(paper => paper.document))
  const ids = papers.map(paper => paper.id)

  const index = state.collection

  index.del(ids, err => {
    if (err) return done(err)
    eos(pumpify(docs, index.add(noop)), err => {
      if (err) return done(err)
      send('collection_scan', null, done)
    })
  })
}
