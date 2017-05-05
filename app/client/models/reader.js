module.exports = (state, bus) => {
  state.reading = null

  bus.on('reader:read', paper => {
    state.reading = { time: new Date(), paper: paper }
    bus.emit('pushState', '#reader')
  })

  bus.on('reader:quit', () => {
    state.reading = null
    bus.emit('pushState', '#home')
  })
}
