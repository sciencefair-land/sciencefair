module.exports = (data, state, send, done) => {
  send('datasources_setshown', !state.datasources.shown, done)
}
