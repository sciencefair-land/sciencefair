// this subscription updates the downloads at 1 second intervals

const datasource = require('../lib/getdatasource')
const sortBy = require('lodash/sortBy')
const flatten = require('lodash/flatten')
const fromPairs = require('lodash/fromPairs')
const sum = require('lodash/sum')

const toPair = dl => { return [`${dl.source}:${dl.id}`, dl] }

const getdownloads = () => {
  const downloads = datasource.all().map(ds => ds.downloads())
  const flattened = flatten(downloads.map(dl => dl.list))
  const dlstats = {
    lookup: fromPairs(flattened.map(toPair)),
    list: sortBy(flattened, 'started'),
    totalspeed: sum(downloads.map(dl => dl.speed))
  }
  return dlstats
}

module.exports = (send, done) => setInterval(
  () => send('downloads_update', getdownloads(), err => {
    if (err) return done(err)
  }),
  1000
)
