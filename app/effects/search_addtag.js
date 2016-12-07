const uniq = require('lodash/uniq')
const cloneDeep = require('lodash/cloneDeep')

module.exports = (data, state, send, done) => {
  const alldone = require('../lib/alldone')(2, done)
  const update = cloneDeep(state.currentsearch || {})

  update.tags = uniq((update.tags || []).concat([data.tag]))
  update.tagquery = null
  update.striptagquery = true

  send('results_clear', null, (err) => {
    if (err) return done(err)
    send('search_update', update, alldone)
  })
}
