const mainwrapper = require('./mainwrapper')
const main = require('./main')

module.exports = (state, emit) => mainwrapper(state, emit, main(state, emit))
