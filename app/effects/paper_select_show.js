module.exports = (data, state, send, done) => {
  send('paper_select', data, (err) => {
    if (err) done(err)
    send('detail_show', null, done)
  })
}
