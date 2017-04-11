const through = require('through2')

module.exports = condition => {
  return through.ctor({ objectMode: true }, (data, enc, next) => {
    if (condition(data)) {
      next(null, data)
    } else {
      next()
    }
  })
}
