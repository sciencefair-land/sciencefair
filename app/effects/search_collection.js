const intersection = require('lodash/intersection')

const parsedoc = doc => {
  return (typeof doc === 'string')
    ? JSON.parse(doc)
    : doc
}

module.exports = (data, state, send, done) => {
  if (!state.collection) {
    return done(new Error('No local collection found (it may not have loaded yet)'))
  }

  if (state.collectioncount === 0) return done()

  if (data.query.trim() === '*') {
    all()
  } else if (data.query && data.query.trim().length > 0) {
    search()
  } else if (data.tags && data.tags.length) {
    filter()
  } else {
    send('results_clear', null, done)
  }

  function parseresults (results) {
    results.hits = results.hits.map((hit) => {
      hit.document = parsedoc(hit.document)
      if (!hit.document.tags) hit.document.tags = []
      hit.collected = true
      hit.source = hit.document.source
      return hit
    })
    return results
  }

  function all () {
    const docstore = state.collection.docstore
    const hits = []
    docstore.createReadStream()
      .on('data', (entry) => {
        const doc = parsedoc(entry.value)
        hits.push({ document: doc })
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

  function search () {
    state.collection.search(data.query.trim(), (err, results) => {
      if (err) done(err)
      if (results.hits.length > 0) {
        if (data.tags && data.tags.length > 0) {
          // filter by tags
          const hits = results.hits.filter((hit) => {
            const doc = parsedoc(hit.document)
            const overlap = intersection(doc.tags, data.tags)
            return overlap.length === data.tags.length
          })
          results.hits = hits
        }
        send('results_receive', parseresults(results), done)
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
        const doc = parsedoc(entry.value)
        const overlap = intersection(doc.tags, data.tags)
        if (overlap.length === data.tags.length) {
          hits.push({ document: doc })
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
