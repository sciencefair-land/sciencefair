const through = require('through2')

module.exports = opts => {
  if (!opts || Object.keys(opts).length === 0) {
    throw new Error('stream-obj-xtend requires an object with properties')
  }
  return through.ctor({ objectMode: true }, (data, enc, next) => {
    Object.assign(data, opts)
    next(null, data)
  })
}
