module.exports = (data, state, send, done) => {
  send('reader_setstate', {
    visible: true,
    paper: state.results.find(
      paper => paper.id === state.selection.list[0]
    )
  }, done)
}
