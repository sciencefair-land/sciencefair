const Mousetrap = require('mousetrap')
const {BrowserWindow} = require('electron').remote

module.exports = (state, bus) => {
  // ESC
  Mousetrap.bind('esc', () => {
    if (state.reading) {
      bus.emit('reader:quit')
    } else if (state.datasources.shown) {
      bus.emit('datasources:toggle-shown')
    } else if (state.aboutshown) {
      bus.emit('about:hide')
    } else {
      const win = BrowserWindow.getFocusedWindow()
      win.setFullScreen(false)
    }
  })
}
