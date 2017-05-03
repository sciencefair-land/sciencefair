const through = require('through2')
const debug = require('debug')('sync-entry')

// through stream to sync hyperdrive entries
module.exports = archive => {
  if (!archive) throw new Error('hyperdrive-sync-entry requires a hyperdrive archive')
  return through.ctor({ objectMode: true }, (data, enc, next) => {
    debug('syncing', data)
    archive.readFile(data.name, 'utf8', (err, json) => {
      if (err) return next(err)
      else {
        next(null, JSON.parse(json))
      }
    })
  })
}
