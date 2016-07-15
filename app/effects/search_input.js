const after = require('lodash/after')

const log = (err) => { if (err) console.log(err) }

module.exports = (data, state, send, done) => {
  send('search_setquery', data, log)
  const alldone = after(state.datasources.length, done)

  state.datasources.forEach((source) => {
    source.search(data.query, (err, results) => {
      if (err) done(err)

      send('results_receive', { results: results }, log)

      alldone()
    })
  })
}
