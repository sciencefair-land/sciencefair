const after = require('lodash/after')

// return a wrapper that calls a function after the wrapper
// is invoked `n` times, or when an error is passed
module.exports = (n, cb) => {
  const alldone = after(n, cb)
  return (err) => {
    if (err) cb(err)
    alldone()
  }
}
