const fs = require('fs-extra')
const path = require('path')

const after = require('lodash/after')

const datasource = require('../../lib/datasource')
const C = require('../../lib/constants')

fs.mkdirsSync(C.DATASOURCES_PATH)

// perform a one-time load of any datasource in the data directory

const load = cb => {
  const keys = fs.readdirSync(
    C.DATASOURCES_PATH
  ).filter(
    file => fs.statSync(path.join(C.DATASOURCES_PATH, file)).isDirectory()
  )

  if (keys.length === 0) return cb()

  const datasources = []

  keys.forEach(key => datasource.fetch(key, (err, ds) => {
    if (err) return cb(err)

    datasources.push(ds)
  }))

  const done = after(datasources.length, cb)

  datasources.forEach(ds => ds.connect(done))
}

module.exports = (send, done) => {
  load(() => send('datasources_setloaded', done))
}
