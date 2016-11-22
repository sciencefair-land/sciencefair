module.exports = (data, state, send, done) => {
  const tags = {}
  var count = 0
  state.collection.docstore.createReadStream()
    .on('data', (data) => {
      const doc = (typeof data.value === 'string') ? JSON.parse(data.value) : data.value
      count += 1
      if (!doc.tags) return
      doc.tags.forEach((tag) => {
        tags[tag] = (tags[tag] || []).concat(data.key)
      })
    })
    .on('error', done)
    .on('end', () => {
      send('collection_setcount', { count: count }, (err) => {
        if (err) done(err)
        send('tags_replace', tags, done)
      })
    })
}
