module.exports = (data, state, send, done) => {
  send('reader_setstate', {
    visible: true,
    paper: state.selection.list[0]
  }, done)
}
