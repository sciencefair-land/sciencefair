const isArray = require('lodash/isArray')
const stream = require('stream-from-array').obj
const pumpify = require('pumpify')
const eos = require('end-of-stream')
const through = require('through2').obj

const noop = () => {}

module.exports = (data, state, send, done) => {
  const papers = isArray(data) ? data : [data]
  const docs = stream(papers)
  const keys = papers.filter(p => !p.collected).map(p => p.key)

  const index = state.collection

  const metadataify = through({ objectMode: true }, (paper, enc, next) => {
    const meta = paper.metadata()
    meta.key = paper.key
    next(null, meta)
  })

  index.del(keys, err => {
    if (err) return done(err)
    eos(pumpify(docs, metadataify, index.add(err => {
      if (err) return done(err)
    })), err => {
      if (err) return done(err)
      send('collection_scan', null, done)
    })
  })
}
