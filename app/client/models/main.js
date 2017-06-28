const C = require('../lib/constants')

module.exports = (state, bus) => {
  state.initialising = false

  let domloaded = false
  let initstarted = true

  const start = () => {
    state.initialising = true
    bus.emit('pushState', '#initial')
  }

  bus.on('initialising:start', () => {
    initstarted = true
    if (domloaded) return start()
  })

  bus.on('DOMContentLoaded', () => {
    domloaded = true
    if (initstarted) return start()
  })

  bus.on('initialising:stop', () => {
    state.initialising = false
    bus.emit('pushState', '#home')
  })
}
