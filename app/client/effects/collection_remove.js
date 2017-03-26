const afterall = require('../lib/alldone')

module.exports = (state, data, send, done) => {
  if (typeof data === 'string') data = [data]

  const removefromdb = afterall(data.length, () => {
    state.collection.del(data.map(d => d.key), err => {
      if (err) return done(err)

      const n = data.length
      send('note_add', {
        title: 'Papers deleted',
        message: `${n} ${n === 1 ? '' : 's'} ha${n === 1 ? 's' : 've'} been removed from the local collection`
      }, done)
    })
  })

  data.forEach(paper => paper.removeFiles(removefromdb))

  send('results_replace', state.results.filter(result => data.indexOf(result) === -1), () => {})
  send('selection_clear', () => {})
  send('detail_toggle', () => {})
  send('collection_scan', () => {})
}
