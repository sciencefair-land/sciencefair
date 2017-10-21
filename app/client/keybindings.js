const Mousetrap = require('mousetrap')
const {BrowserWindow} = require('electron').remote

const ignoreSelectAllIds = [
  'cached-search-input',
  'cached-ds-add-input',
  'cached-tag-add-input'
]

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

  // ctrl/cmd + a
  Mousetrap.bind(['command+a', 'ctrl+a'], () => {
    const active = document.activeElement
    if (active.id && ignoreSelectAllIds.includes(active.id)) {
      // this element implements its own select all or uses native implementation
      return
    } else if (state.datasources.shown || state.aboutshown || state.reader) {
      // overlay view
      return
    } else if (state.results) {
      // select all results
      bus.emit('selection:all')
      return false
    }
  })
}
