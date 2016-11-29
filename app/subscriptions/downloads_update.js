// this subscription updates the downloads at 1 second intervals

const datasource = require('../../lib/datasource')
const sortBy = require('lodash/sortBy')
const flatten = require('lodash/flatten')
const sum = require('lodash/sum')

const getdownloads = () => {
  const downloads = datasource.all().map(ds => ds.downloads())
  const dlstats = {
    list: sortBy(flatten(downloads.map(dl => dl.list)), 'started'),
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
