module.exports = (data, state, send, done) => {
  const tags = {}
  state.collection.docstore.createReadStream()
    .on('data', (data) => {
      const doc = JSON.parse(data.value)
      doc.tags.forEach((tag) => {
        tags[tag] = (tags[tag] || []).concat(data.key)
      })
    })
    .on('error', done)
    .on('end', () => {
      send('tags_replace', tags, done)
    })
}
