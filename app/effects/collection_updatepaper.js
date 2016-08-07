module.exports = (data, state, send, done) => {
  const paper = data
  const doc = paper.document

  const index = state.collection

  index.add([doc], {}, done)
}
