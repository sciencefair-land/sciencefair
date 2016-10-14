const after = require('lodash/after')

module.exports = (data, state, send, done) => {
  if (!state.datasources.list) {
    done(new Error('No datasources found (they may not have loaded yet)'))
  }

  const alldone = after(state.datasources.list.length, done)

  Object.keys(state.datasources.list).forEach((name) => {
    console.log('SEARCHING DATASOURCE', state.datasources.list[name])
    const source = state.datasources.list[name].source

    source.db.search(data.query, (err, results) => {
      console.log(data)
      if (err) console.log(err)

      if (results) {
        send('results_recieve', results, alldone)
      } else {
        send('results_none', name, alldone)
      }
    })
  })
}
