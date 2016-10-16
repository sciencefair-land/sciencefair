const groupBy = require('lodash/groupBy')
const datasource = require('../../lib/datasource')

module.exports = (data, state, send, done) => {
  const groups = groupBy(data, 'source')

  const alldone = require('../../lib/alldone')(Object.keys(groups).length, done)

  const startdownloads = key => datasource.fetch(key, (err, ds) => {
    if (err) return done(err)

    groups[key].forEach(ds.download)
    alldone()
  })

  console.log('groups', groups)
  Object.keys(groups).forEach(key => startdownloads)
}
