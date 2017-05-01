module.exports = (state, bus) => {
  bus.on('reader:read', paper => {
    const key = encodeURIComponent(paper.key)
    bus.emit('pushState', `/reader/${key}`)
  })

  bus.on('reader:quit', () => {
    bus.emit('pushState', '/home')
  })
}
