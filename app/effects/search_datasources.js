const after = require('lodash/after')
const datasource = require('../lib/getdatasource')
const bulk = require('bulk-write-stream')
const pump = require('pump')

module.exports = (data, state, send, done) => {
  if (!state.datasources.list || state.datasources.list.length === 0) {
    return done(
      new Error('No datasources found (they may not have loaded yet)')
    )
  }

  const active = state.datasources.list.filter(
    ds => ds.active && !ds.loading
  )
  
  if (active.length === 0) return send('results_none', done)

  const resultbatcher = ds => {
    let count = 0

    const write = (list, cb) => {
      count += list.length

      send('results_receive', {
        hits: list.map(r => {
          r.source = ds.key
          return r
        })
      }, cb)
    }

    const flush = cb => {
      if (count === 0) send('results_none', ds.name, alldone)
    }

    return bulk.obj({ highWaterMark: 50 }, write, flush)
  }

  const alldone = after(active.length, done)

  active.forEach(ds => datasource.fetch(ds.key, (err, source) => {
    if (err) return done(err)

    pump(source.db.search(data.query), resultbatcher(source), err => {
      if (err) return done(err)
      alldone()
    })
  }))
}
