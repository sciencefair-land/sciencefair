const groupBy = require('lodash/groupBy')
const datasource = require('../../lib/datasource')

module.exports = (data, state, send, done) => {
  const groups = groupBy(data, 'source')

  const alldone = require('../../lib/alldone')(data.length, done)

  const startdownloads = key => datasource.fetch(key, (err, ds) => {
    if (err) return done(err)

    groups[key].forEach(article => ds.download(article, alldone))
  })

  Object.keys(groups).forEach(key => startdownloads(key))
}
