// this subscription sets downloads running that were part-completed
// when the app last quit

const localcollection = require('../lib/localcollection')
const getpaper = require('../lib/getpaper')

const restartdownloads = cb => localcollection(
  (err, db) => {
    let n = 0
    db.docstore
      .createReadStream()
      .on('data', data => {
        const paper = getpaper(data.value)
        if (!paper.progress || paper.progress < 100) {
          n++
          paper.download(() => {})
        }
      })
      .on('end', () => cb(null, n))
      .on('error', cb)
  }
)

module.exports = (send, done) => restartdownloads((err, n) => {
  if (err) return done(err)
  if (n > 0) {
    send('note_add', {
      title: 'Restoring downloads',
      message: `${n} partially completed downloads have been restarted`
    }, done)
  } else {
    done()
  }
})
