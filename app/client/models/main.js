const C = require('../lib/constants')

module.exports = (state, bus) => {
  state.initialising = false

  bus.on('initialising:start', () => {
    state.initialising = true
    bus.emit('pushState', '/initial')
  })

  bus.on('initialising:stop', () => {
    state.initialising = false
    bus.emit('pushState', '/home')
  })
}
