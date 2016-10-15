const after = require('lodash/after')
const datasource = require('../../lib/datasource')

module.exports = (data, state, send, done) => {
  if (!state.datasources.list || state.datasources.list.length === 0) {
    done(new Error('No datasources found (they may not have loaded yet)'))
  }

  const active = state.datasources.list.filter(
    ds => ds.active && !ds.loading && ds.stats.articleCount > 0
  )

  const alldone = after(active.length, done)

  active.forEach(ds => {
    datasource.fetch(ds.key, (err, source) => {
      if (err) done(err)

      source.db.search(data.query, (err, results) => {
        if (err) done(err)

        if (results) {
          send('results_recieve', results, alldone)
        } else {
          send('results_none', ds.name, alldone)
        }
      })
    })
  })
}
