const html = require('choo/html')

module.exports = (state, emit) => {
  return require('./mainwrapper')(
    state, emit, require('./main')(state, emit)
  )
}
