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
        n++
      })
      .on('end', () => {
        let loaded = 0
        let incomplete = 0
        db.docstore
          .createReadStream()
          .on('data', data => {
            const paper = getpaper(data.value)
            paper.filesPresent((err, progress) => {
              if (err) return cb(err)
              loaded ++
              if (progress < 100) {
                incomplete++
                paper.download(() => {})
              }
              if (loaded === n) cb(null, incomplete)
            })
          })
      })
      .on('error', cb)
  }
)

module.exports = (send, done) => restartdownloads((err, n) => {
  if (err) return done(err)
  if (n > 0) {
    send('note_add', {
      title: 'Restoring downloads',
      message: `${n} partially completed download${n === 1 ? '' : 's'} ha${n === 1 ? 's' : 've'} been restarted`
    }, done)
  } else {
    done()
  }
})
