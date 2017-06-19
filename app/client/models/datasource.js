// add

const datasource = require('../lib/getdatasource')

module.exports = (state, data, emit, done) => {
  if (data.key.length !== 64) {
    return done(new Error(`datasource keys must be 64 characters long, but ${data.key} has length ${data.key.length}`))
  }
  datasource.fetch(data, (err, ds) => {
    if (err) return done(err)
    ds.toggleActive()
    ds.connect(err => done(err, ds))
  })
}


// remove

const datasource = require('../lib/getdatasource')

module.exports = (state, data, emit, done) => {
  datasource.del(data.key)
  done()
}


// toggleActive

const cloneDeep = require('lodash/cloneDeep')
const datasource = require('../lib/getdatasource')

module.exports = (state, data, emit, done) => {
  const entry = state.datasources.list.find(ds => ds.key === data.key)

  if (!entry) {
    return done(new Error('no datasource in state for', entry.name))
  }

  const update = cloneDeep(state.datasources)

  const ds = update.list.find(ds => ds.key === data.key)
  ds.active = !data.active

  datasource.fetch(data.key, (err, source) => {
    if (err) return done(err)

    source.toggleActive()
    if (source.stats.get('active').value()) {
      source.syncMetadata(err => {
        if (err) done(err)
        emit('datasources_update', update, done)
      })
    } else emit('datasources_update', update, done)
  })
}

// update

const cloneDeep = require('lodash/cloneDeep')

module.exports = (state, data, emit, done) => {
  const update = cloneDeep(state.datasources.list)

  const target = update.find(ds => ds.key === data.key)

  if (target) Object.assign(target, data)

  emit('datasources_update', update, done)
}
