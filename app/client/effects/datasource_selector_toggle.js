module.exports = (state, data, send, done) => {
  send('datasources_setshown', !state.datasources.shown, done)
}
