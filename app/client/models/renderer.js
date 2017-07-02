const throttle = require('lodash/throttle')

module.exports = (state, bus) => {
  const render = () => bus.emit('render')
  const queue = throttle(render, 250, { leading: true, trailing: true })
  let frozen = false

  const freeze = () => frozen = true
  const unfreeze = () => frozen = false

  const mayberender = () => {
    if (frozen) {
      return
    } else {
      queue()
    }
  }

  bus.on('renderer:freeze', freeze)
  bus.on('renderer:unfreeze', unfreeze)
  bus.on('renderer:render', mayberender)
}
