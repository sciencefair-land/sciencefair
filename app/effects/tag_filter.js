module.exports = (data, state, send, done) => {
  send('search_addquery', { query: { tags: [data.tag] } }, done)
}
