require('./lib/setup')

const { app, BrowserWindow, shell, Menu } = require('electron')
const defaultMenu = require('electron-default-menu')

let main = null

const shouldQuit = app.makeSingleInstance((cliargs, cwd) => {
  // Someone tried to run a second instance, we should focus our window.
  if (main) {
    if (main.isMinimized()) main.restore()
    main.focus()
  }
})

if (shouldQuit) {
  app.quit()
} else {
  require('electron-debug')({ enabled: true })

  const path = require('path')

  app.commandLine.appendSwitch('enable-features', 'V8Ignition')
  app.commandLine.appendSwitch('enable-webassembly')

  app.on('ready', function () {
    main = new BrowserWindow({
      height: 750,
      width: 1080,
      minHeight: 750,
      minWidth: 1080,
      resizable: true,
      title: 'sciencefair',
      backgroundColor: '#fff',
      titleBarStyle: 'hidden',
      fullscreenable: true,
      icon: './icon/logo.png',
      show: false,
      webPreferences: {
        webSecurity: false
      }
    })

    const menu = defaultMenu(app, shell)

    Menu.setApplicationMenu(Menu.buildFromTemplate(menu))

    main.loadURL(path.join('file://', __dirname, '/client/index.html'))

    // hack to avoid a blank white window showing briefly at startup
    // hide the window until content is loaded
    main.webContents.on('did-finish-load', () => {
      main.webContents.setFrameRate(30)
      setTimeout(() => main.show(), 40)
    })

    if (!process.env['SCIENCEFAIR_DEVMODE']) {
      // Initate auto-updates on MacOS and Windows
      main.webContents.once('did-frame-finish-load', () => {
        const winormac = process.platform === 'darwin' || process.platform === 'win32'
        if (winormac) require('./client/lib/updater')()
      })
    }

    main.on('close', event => {
      main.webContents.emit('quitting')
    })

    main.on('closed', function () {
      main = null
    })
  })

  app.on('window-all-closed', () => app.quit())
}
