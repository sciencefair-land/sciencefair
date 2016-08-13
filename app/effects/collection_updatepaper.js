const isArray = require('lodash/isArray')

module.exports = (data, state, send, done) => {
  const papers = isArray(data) ? data : [data]
  const docs = papers.map((paper) => paper.document)

  const index = state.collection

  index.del(papers.map((paper) => paper.id), (err) => {
    if (err) done(err)
    index.add(docs, {}, (err) => {
      if (err) done(err)
      send('collection_scan', null, done)
    })
  })
}
