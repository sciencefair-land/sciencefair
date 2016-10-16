// this subscription updates the downloads at 1 second intervals

const datasource = require('../../lib/datasource')
const sortBy = require('lodash/sortBy')

const getdownloads = () => {
  const list = datasource.all().map(ds => ds.downloads())
  return {
    list: sortBy(list, 'started'),
    totalspeed: 0
  }
}

const err = err => { if (err) console.error('error updating datasources', err) }

module.exports = (send, done) => {
  setInterval(() => send('downloads_update', getdownloads(), err), 1000)
}
