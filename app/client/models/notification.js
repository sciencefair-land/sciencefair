const uuid = require('uuid')

module.exports = (state, bus) => {
  state.notifications = {}

  const updatemessages = () => bus.emit('renderer:render')

  const removemessage = messageid => {
    if (state.notifications[messageid]) {
      delete state.notifications[messageid]
      updatemessages()
    }
  }

  const addmessage = data => {
    if (!data.title && !data.message) return

    const messageid = uuid()
    data.messageid = messageid
    state.notifications[messageid] = data

    setTimeout(() => removemessage(messageid), 3000)

    updatemessages()
  }

  bus.on('notification:add', addmessage)
  bus.on('notification:remove', removemessage)
}
