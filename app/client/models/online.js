const isOnline = require('is-online')

module.exports = (state, bus) => {
  state.online = false

  const update = online => {
    const changed = state.online !== online
    state.online = online
    if (changed) bus.emit('renderer:render')
  }

  const check = () => isOnline().then(update)

  setInterval(check, 10000)

  bus.on('DOMContentLoaded', check)
}
