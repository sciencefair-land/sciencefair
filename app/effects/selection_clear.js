module.exports = (data, state, send, done) => {
  send('selection_set', {
    reference: null,
    list: [],
    lookup: {}
  }, done)
}
