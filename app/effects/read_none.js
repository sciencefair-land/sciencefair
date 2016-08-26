module.exports = (data, state, send, done) => {
  send('reader_setstate', {
    visible: false,
    paper: null
  }, done)
}
