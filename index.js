const {app, BrowserWindow, protocol} = require('electron')
var path = require('path')

var main = null

app.on('ready', function () {
  main = new BrowserWindow({
    height: 720,
    resizable: true,
    title: 'sciencefair',
    width: 1050,
    titleBarStyle: 'hidden',
    fullscreen: false,
    icon: './icon/logo.png',
    frame: false
  })

  main.setMenu(null)

  main.maximize()

  main.loadURL(path.join('file://', __dirname, '/app/index.html'))

  main.on('close', event => {
    main.webContents.send('quitting')
  })

  main.on('closed', function () {
    main = null
  })

  protocol.registerFileProtocol('sciencefair', (request, callback) => {
    console.log(request.url)
    callback()
  }, error => {
    if (error) console.error('Failed to register protocol')
  })
})
