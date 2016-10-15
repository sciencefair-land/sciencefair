const fs = require('fs')
const path = require('path')

const after = require('lodash/after')

const datasource = require('../../lib/datasource')
const C = require('../../lib/constants')

// perform a one-time load of any datasource in the data directory

const load = cb => {
  const datasources = fs.readdirSync(
    C.DATASOURCES_PATH
  ).filter(
    file => fs.statSync(path.join(C.DATASOURCES_PATH, file)).isDirectory()
  ).map(
    datasource.fetch
  )

  const done = after(datasources.length, cb)

  datasources.forEach(ds => ds.connect(done))
}

module.exports = (send, done) => {
  load(() => send('datasources_setloaded', done))
}
