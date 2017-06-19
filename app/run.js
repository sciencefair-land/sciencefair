const { app, BrowserWindow, protocol } = require('electron')

// if (process.env['SCIENCEFAIR_DEVMODE']) require('electron-debug')({ enable: true })
require('electron-debug')({ enabled: true })

const path = require('path')
const open = require('opn')

var main = null

app.on('ready', function () {
  main = new BrowserWindow({
    height: 750,
    width: 1080,
    minHeight: 750,
    minWidth: 1080,
    resizable: true,
    title: 'sciencefair',
    titleBarStyle: 'hidden',
    fullscreen: false,
    icon: './icon/logo.png',
    show: false,
    webPreferences: {
      webSecurity: false
    }
  })

  main.setMenu(null)

  main.loadURL(path.join('file://', __dirname, '/client/index.html'))

  // hack to avoid a blank white window showing briefly at startup
  // hide the window until content is loaded
  main.webContents.on('did-finish-load', () => {
    main.webContents.setFrameRate(30)
    setTimeout(() => main.show(), 40)
  })

  const handleRedirect = (e, url) => {
    if(url != main.webContents.getURL()) {
      e.preventDefault()
      open(url)
    }
  }

  main.webContents.on('will-navigate', handleRedirect)
  main.webContents.on('new-window', handleRedirect)

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
