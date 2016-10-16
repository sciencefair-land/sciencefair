module.exports = (data, state, send, done) => {
  send('reader_setstate', {
    visible: true,
    paper: state.results.find(
      paper => paper.id === state.selection.papers[0]
    )
  }, done)
}
