module.exports = (state, bus) => {
  state.aboutshown = false

  const render = () => bus.emit('renderer:render')

  const set = bool => { state.aboutshown = bool }

  const show = () => {
    set(true)
    render()
  }
  const hide = () => {
    set(false)
    render()
  }

  bus.on('about:show', show)
  bus.on('about:hide', hide)
}
