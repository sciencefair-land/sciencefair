const fs = require('fs')
const path = require('path')

const after = require('lodash/after')

const datasource = require('../../lib/datasource')
const C = require('../../lib/constants')

const update = cb => {
  const datasources = fs.readdirSync(
    C.DATASOURCES_PATH
  ).filter(
    file => fs.statSync(path.join(C.DATASOURCES_PATH, file)).isDirectory()
  ).map(
    datasource
  )

  const done = after(
    datasources.length,
    () => cb(
      datasources.map(ds => ds.data())
    )
  )

  datasources.forEach(ds => ds.load(done))
}

module.exports = (send, done) => {
  setInterval(
    () => update(datasources => send('datasources_update', datasources)),
    5000
  )
}
