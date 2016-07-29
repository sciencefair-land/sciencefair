module.exports = (data, state, send, done) => {
  if (!state.collection) {
    done(new Error('No local collection found (it may not have loaded yet)'))
  }

  state.collection.search(data, { pageSize: 1000 }, (err, results) => {
    if (err) console.log(err)

    if (results) {
      send('results_recieve', results, done)
    } else {
      send('results_none', 'collection')
    }
  })
}
