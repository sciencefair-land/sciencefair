const throttle = require('lodash/throttle')

module.exports = (state, bus) => {
  const render = () => bus.emit('render')
  const queue = throttle(render, 250)

  const mayberender = () => {
    if (state.reading) {
      return
    } else {
      queue()
    }
  }

  bus.on('renderer:render', mayberender)
}
