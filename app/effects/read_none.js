module.exports = (state, data, send, done) => {
  send('reader_setstate', {
    visible: false,
    paper: null
  }, done)
}
