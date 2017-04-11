module.exports = (state, bus) => {
  bus.on('reader:loadpaper', paperkey => {
    bus.emit('pushState', `/reader/${paperkey}`)
  })

  bus.on('reader:quit', () => {
    bus.emit('pushState', '/')
  })
}


// setstate

module.exports = (state, data) => {
  return { reader: data }
}


// none

module.exports = (state, data, emit, done) => {
  emit('reader_setstate', {
    visible: false,
    paper: null
  }, done)
}


// selection

module.exports = (state, data, emit, done) => {
  emit('reader_setstate', {
    visible: true,
    paper: state.selection.list[0]
  }, done)
}
