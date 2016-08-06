const intersection = require('lodash/intersection')

module.exports = (data, state, send, done) => {
  if (!state.collection) {
    done(new Error('No local collection found (it may not have loaded yet)'))
  }

  if (data.query) {
    search()
  } else if (data.tags && data.tags.length) {
    filter()
  } else {
    done(new Error('Empty search (no query or tags)'))
  }

  function search () {
    state.collection.search(data.query, (err, results) => {
      if (err) done(err)
      if (results.hits.length > 0) {
        if (data.tags && data.tags.length > 0) {
          // filter by tags
          const hits = results.hits.filter((hit) => {
            const doc = JSON.parse(hit.document)
            const overlap = intersection(doc.tags, data.tags)
            return overlap.length === data.tags.length
          })
          results.hits = hits
        }
        send('results_receive', results, done)
      } else {
        send('results_none', 'collection', done)
      }
    })
  }

  function filter () {
    const docstore = state.collection.docstore
    const hits = []

    docstore.createReadStream()
      .on('data', (entry) => {
        const doc = JSON.parse(entry.value)
        const overlap = intersection(doc.tags, data.tags)
        if (overlap.length === data.tags.length) {
          hits.push(doc)
        }
      })
      .on('error', done)
      .on('end', () => {
        if (hits.length > 0) {
          send('results_receive', {
            hits: hits
          }, done)
        } else {
          send('results_none', 'collection', done)
        }
      })
  }
}
