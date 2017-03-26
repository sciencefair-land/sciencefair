module.exports = (state, data, send, done) => {
  send('paper_select', data, (err) => {
    if (err) done(err)
    send('detail_show', null, done)
  })
}
