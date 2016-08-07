const cloneDeep = require('lodash/cloneDeep')

module.exports = (data, state, send, done) => {
  const queryparts = data.query.split('#')
  const newquery = queryparts[0].trim()
  const newtagquery = queryparts[1]

  var update = cloneDeep(state.currentsearch)
  update.query = newquery
  update.tagquery = newtagquery

  send('results_clear', null, (err) => {
    if (err) return done(err)
    send('search_update', update, done)
  })
}
