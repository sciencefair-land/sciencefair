module.exports = (data, state, send, done) => {
  state.collection.del(data, done)
}
