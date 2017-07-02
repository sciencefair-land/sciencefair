module.exports = (state, bus) => {
  state.reading = null

  bus.on('reader:read', paper => {
    bus.emit('renderer:freeze')
    if (state.reading) return
    state.reading = paper
    bus.emit('pushState', '#reader')
  })

  bus.on('reader:quit', () => {
    bus.emit('renderer:unfreeze')
    state.reading = null
    bus.emit('pushState', '#home')
  })
}
