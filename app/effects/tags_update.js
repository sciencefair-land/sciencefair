module.exports = (data, state, send, done) => {
  const tags = {}
  state.collection.createReadStream()
    .on('data', (data) => { tags[data.key] = data.value })
    .on('error', done)
    .on('end', () => {
      send('tags_replace', tags, done)
    })
}
