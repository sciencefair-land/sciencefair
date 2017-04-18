module.exports = (state, bus) => {
  state.downloads = {
    totalspeed: 0,
    list: [],
    lookup: {}
  }

  const speed = () => state.downloads.totalspeed
  const setspeed = speed => { state.downloads.totalspeed = speed }

  const list = () => state.downloads.list
  const setlist = list => { state.downloads.list = list }

  const lookup = () => state.downloads.lookup
  const setlookup = lookup => { state.downloads.lookup = lookup }

  const add = papers => {
    const allready = all(papers.forEach(p => p.ds.articleMetadataSynced()))
    papers.forEach(p => p.download(alldone))
    if (!allready) {
      emit('notification:add', {
        title: `Download${papers.length > 1 ? 's' : ''} queued`,
        message: 'Datasource is still syncing metadata, downloads queued'
      })
    }
    emit('tags:add', { tag: '__local', paper: papers })
  }

  bus.emit('downloads:add', add)
}

// // online
//
// const online = require('is-online')
//
// module.exports = (emit, done) => setInterval(
//   () => online((err, up) => {
//     if (err) return console.log(err)
//     emit('online_update', up, err => {
//       if (err) return done(err)
//     })
//   }),
//   5000
// )
//
// module.exports = (state, data) => {
//   return { online: data }
// }
//
//
// // resume
//
// // this subscription sets downloads running that were part-completed
// // when the app last quit
//
// const localcollection = require('../lib/localcollection')
// const getpaper = require('../lib/getpaper')
//
// const restartdownloads = cb => localcollection(
//   (err, db) => {
//     let n = 0
//     db.docstore
//       .createReadStream()
//       .on('data', data => {
//         n++
//       })
//       .on('end', () => {
//         let loaded = 0
//         let incomplete = 0
//         db.docstore
//           .createReadStream()
//           .on('data', data => {
//             const paper = getpaper(data.value)
//             paper.filesPresent((err, progress) => {
//               if (err) return cb(err)
//               loaded ++
//               if (progress < 100) {
//                 console.log('restarting paper download')
//                 incomplete++
//                 paper.download(() => {})
//               }
//               if (loaded === n) cb(null, incomplete)
//             })
//           })
//       })
//       .on('error', cb)
//   }
// )
//
// module.exports = (emit, done) => restartdownloads((err, n) => {
//   if (err) return done(err)
//   if (n > 0) {
//     emit('note_add', {
//       title: 'Restoring downloads',
//       message: `${n} partially completed download${n === 1 ? '' : 's'} ha${n === 1 ? 's' : 've'} been restarted`
//     }, done)
//   } else {
//     done()
//   }
// })
//
//
// // update
//
// // this subscription updates the downloads at 1 second intervals
//
// const datasource = require('../lib/getdatasource')
// const sortBy = require('lodash/sortBy')
// const flatten = require('lodash/flatten')
// const fromPairs = require('lodash/fromPairs')
// const sum = require('lodash/sum')
//
// const toPair = dl => { return [`${dl.source}:${dl.id}`, dl] }
//
// const getdownloads = () => {
//   const downloads = datasource.all().map(ds => ds.downloads())
//   const flattened = flatten(downloads.map(dl => dl.list))
//   const dlstats = {
//     lookup: fromPairs(flattened.map(toPair)),
//     list: sortBy(flattened, 'started'),
//     totalspeed: sum(downloads.map(dl => dl.speed))
//   }
//   return dlstats
// }
//
// module.exports = (emit, done) => setInterval(
//   () => emit('downloads_update', getdownloads(), err => {
//     if (err) return done(err)
//   }),
//   1000
// )
