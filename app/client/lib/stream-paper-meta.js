const through = require('through2')

module.exports = () => {
  return through.ctor({ objectMode: true }, (data, enc, next) => {
    next(null, data.metadata())
  })
}
