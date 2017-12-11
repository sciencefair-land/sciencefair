module.exports = (state, bus) => {
  state.detailshown = false

  const render = () => bus.emit('renderer:render')

  const set = bool => { state.detailshown = bool }
  const get = () => state.detailshown

  const show = () => {
    set(true)
    render()
  }

  const hide = () => {
    set(false)
    render()
  }

  const toggle = () => {
    set(!get())
    render()
  }

  bus.on('detail:show', show)
  bus.on('detail:hide', hide)
  bus.on('detail:toggle', toggle)
}
