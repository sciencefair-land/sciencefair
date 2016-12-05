const datasource = require('../../lib/getdatasource')
const all = require('lodash/every')

module.exports = (data, state, send, done) => {
  const allready = all(data.forEach(p => p.ds.articleMetadataSynced()))
  const ntasks = data.length + allready ? 1 : 2
  const alldone = require('../../lib/alldone')(ntasks, done)
  data.forEach(p => p.download(alldone))
  if (!allready) {
    send('note_add', {
      title: `Download${data.length > 1 ? 's' : ''} queued`,
      message: 'Datasource is still syncing metadata, downloads queued'
    }, alldone)
  }
  send('tag_add', { tag: '__local', paper: data }, alldone)
}
