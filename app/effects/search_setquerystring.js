const cloneDeep = require('lodash/cloneDeep')

module.exports = (data, state, send, done) => {
  const queryparts = data.query.split('#')
  const newquery = queryparts[0].trim()
  const newtagquery = queryparts.length === 2 ? queryparts[1] || '' : null

  var update = cloneDeep(state.currentsearch)
  update.query = newquery.replace(/et al\.?$/, '')
  update.tagquery = newtagquery

  send('results_clear', null, (err) => {
    if (err) return done(err)
    send('search_update', update, done)
  })
}
