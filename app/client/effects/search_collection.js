const intersection = require('lodash/intersection')
const bulk = require('bulk-write-stream')
const pump = require('pump')

const parsedoc = doc => {
  return (typeof doc === 'string')
    ? JSON.parse(doc)
    : doc
}

module.exports = (state, data, send, done) => {
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
    results = results.map(hit => {
      hit.document = parsedoc(hit.document)
      if (!hit.document.tags) hit.document.tags = []
      hit.collected = true
      hit.source = hit.document.source
      return hit
    })
    return { hits: results }
  }

  function all () {
    const docstore = state.collection.docstore
    const hits = []
    docstore.createReadStream()
      .on('data', (entry) => {
        const doc = parsedoc(entry.value)
        hits.push(doc)
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
    const query = data.query.replace('*', '').trim()

    const resultbatcher = () => {
      let count = 0

      const write = (list, cb) => {
        count += list.length

        if (data.tags && data.tags.length > 0) {
          // filter by tags
          list = list.filter(hit => {
            const doc = parsedoc(hit.document)
            const overlap = intersection(doc.tags, data.tags)
            return overlap.length === data.tags.length
          })
        }
        send('results_receive', parseresults(list), cb)
      }

      const flush = cb => {
        if (count === 0) send('results_none', 'collection', done)
      }

      return bulk.obj({ highWaterMark: 50 }, write, flush)
    }

    pump(state.collection.search(data.query), resultbatcher(), done)
  }

  function filter () {
    const docstore = state.collection.docstore
    const hits = []

    docstore.createReadStream()
      .on('data', (entry) => {
        const doc = parsedoc(entry.value)
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
