const {app, globalShortcut} = require('electron').remote

module.exports = (state, emit) => {
  globalShortcut.register('Esc', () => {
    console.log('foobar')
  })
}
