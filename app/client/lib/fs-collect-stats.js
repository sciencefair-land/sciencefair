const afterall = require('./alldone')
const clone = o => JSON.parse(JSON.stringify(o))

module.exports = (files, opts, cb) => {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  const fs = opts.fs || require('fs')
  const collect = opts.collect || ['size']
  const errorStat = opts.errorStat || null

  const summary = { size: 0 }
  const filestats = []

  const done = afterall(files.length, err => {
    if (err) return cb(err)
    cb(null, { summary: summary, files: filestats })
  })

  files.forEach(file => {
    fs.stat(file, (err, stat) => {
      if (err) {
        if (errorStat) stat = clone(errorStat)
        else return done(err)
      }
      stat.path = file
      filestats[file] = stat
      collect.forEach(key => { summary[key] += stat[key] })
      done()
    })
  })
}
