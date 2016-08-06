const intersection = require('lodash/intersection')

module.exports = (data, state, send, done) => {
  if (!state.collection.index) {
    done(new Error('No local collection found (it may not have loaded yet)'))
  }

  state.collection.index.search(data.query || '', (err, results) => {
    if (err) done(err)
    if (results.hits.length > 0) {
      if (data.tags && data.tags.length > 0) {
        // filter by tags
        const hits = results.hits.filter((hit) => {
          const overlap = intersection(hit.tags, data.tags)
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
