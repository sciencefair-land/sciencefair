const Mousetrap = require('mousetrap')
const {BrowserWindow} = require('electron').remote

module.exports = (state, bus) => {

  // ESC
  Mousetrap.bind('esc', () => {
    if (state.datasources.shown) {
      bus.emit('datasources:toggle-shown')
    } else {
      const win = BrowserWindow.getFocusedWindow()
      win.setFullScreen(false)
    }
  })

}
