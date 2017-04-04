module.exports = (state, data, send, done) => {
  send('selection_set', {
    reference: null,
    list: [],
    lookup: {}
  }, done)
}
