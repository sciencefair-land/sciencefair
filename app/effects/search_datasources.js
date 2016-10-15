const after = require('lodash/after')
const datasource = require('../../lib/datasource')

module.exports = (data, state, send, done) => {
  if (!state.datasources.list) {
    done(new Error('No datasources found (they may not have loaded yet)'))
  }

  const active = state.datasources.list.filter(ds => ds.active && !ds.loading)
  const alldone = after(active.length, done)

  active.forEach(ds => {
    console.log('SEARCHING DATASOURCE', ds.name)
    datasource.fetch((err, source) => {
      console.log(source)
      if (err) done(err)

      source.db.search(data.query, (err, results) => {
        console.log(data)
        if (err) console.log(err)

        if (results) {
          send('results_recieve', results, alldone)
        } else {
          send('results_none', ds.name, alldone)
        }
      })
    })
  })
}
