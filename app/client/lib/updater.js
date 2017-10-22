module.exports = () => {
  try {
    const { app, dialog } = window.require('electron')
    const { autoUpdater } = require('electron-updater')
    // Log whats happening
    const log = require('electron-log')
    log.transports.file.level = 'info'
    autoUpdater.logger = log

    autoUpdater.on('update-downloaded', (event, info) => {
      dialog.showMessageBox({
        type: 'question',
        buttons: ['Install and Relaunch', 'Later'],
        defaultId: 0,
        message: 'A new version of ScienceFair has been downloaded',
        detail: 'It will be installed the next time you restart the application'
      }, response => {
        if (response === 0) {
          setTimeout(() => autoUpdater.quitAndInstall(), 1)
        }
      })
    })
    autoUpdater.checkForUpdates()
  } catch (e) {
    console.error('Could not load auto-updater (perhaps app is not installed)', e)
  }
}
