module.exports = (data, state, send, done) => {
  send('search_setquery', {
    newquery: {
      tags: [],
      query: ''
    }
  }, done)
}
