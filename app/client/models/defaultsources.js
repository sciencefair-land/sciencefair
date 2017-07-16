const {ipcRenderer} = require('electron')

module.exports = (state, bus) => {
  bus.on('DOMContentLoaded', () => {
    ipcRenderer.send('datasources:loadDefaults')

    ipcRenderer.on('datasources:defaultLoaded', (event, key) => {
      if (key) bus.emit('datasources:add', { key: key, active: true })
    })
  })
}
