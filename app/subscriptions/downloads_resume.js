// this subscription sets downloads running that were part-completed
// when the app last quit

const localcollection = require('../../lib/localcollection')
const getpaper = require('../../lib/getpaper')

const restartdownloads = cb => localcollection(
  (err, db) => db.docstore
    .createReadStream()
    .on('data', data => {
      const paper = getpaper(data.value)
      if (!paper.progress || paper.progress < 100) paper.download(() => {})
    })
    .on('end', cb)
    .on('error', cb)
)

module.exports = (send, done) => restartdownloads(done)
