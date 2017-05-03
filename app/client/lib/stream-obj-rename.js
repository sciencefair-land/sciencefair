const through = require('through2')

module.exports = opts => {
  return through.ctor({ objectMode: true }, (data, enc, next) => {
    data[opts.to] = data[opts.from]
    next(null, data)
  })
}
