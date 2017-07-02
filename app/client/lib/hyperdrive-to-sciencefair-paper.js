const through = require('through2')
const paper = require('./getpaper')

// through stream to convert hyperdrive history entries to
// sciencefair papers
module.exports = () => {
  return through.ctor({ objectMode: true }, (data, enc, next) => {
    next(null, paper(data))
  })
}
