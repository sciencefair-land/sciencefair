module.exports = (data, state, send, done) => {

  send('results_none', 'collection')
  send('search_trickle', { query: '', tags: [] })
}
