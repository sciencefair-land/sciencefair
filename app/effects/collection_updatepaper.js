module.exports = (data, state, send, done) => {
  const paper = data
  const doc = paper.document

  const index = state.collection.index

  console.log(doc)
  index.get(paper.id, (err) => {
    if (err) {
      // paper not yet in collection
      console.log('paper not yet in collection')
      index.add([doc], {}, done)
    } else {
      // paper already in index
      console.log('paper already in collection')
      index.del(paper.id, (err) => {
        if (err) done(err)
        index.add([doc], {}, done)
      })
    }
  })
}
