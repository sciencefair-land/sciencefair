const {app, BrowserWindow, protocol} = require('electron')

if (process.env['SCIENCEFAIR_DEVMODE']) require('electron-debug')({ enable: true })

var path = require('path')

var main = null

app.on('ready', function () {
  main = new BrowserWindow({
    minHeight: 600,
    minWidth: 800,
    resizable: true,
    title: 'sciencefair',
    titleBarStyle: 'hidden',
    fullscreen: false,
    icon: './icon/logo.png',
    show: false
  })

  main.setMenu(null)

  main.maximize()

  main.loadURL(path.join('file://', __dirname, '/app/index.html'))

  // hack to avoid a blank white window showing briefly at startup
  // hide the window until content is loaded
  main.webContents.on('did-finish-load', () => {
    setTimeout(() => main.show(), 40)
  })

  main.on('close', event => {
    main.webContents.send('quitting')
  })

  main.on('closed', function () {
    main = null
  })
})

app.on('window-all-closed', () => app.quit())
