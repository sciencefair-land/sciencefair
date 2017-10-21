module.exports = (state, bus) => bus.on('error', err => { throw err })
