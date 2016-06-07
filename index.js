const {app, BrowserWindow} = require('electron')
var path = require('path')

var main = null

app.on('ready', function () {
  main = new BrowserWindow({
    height: 720,
    resizable: true,
    title: 'sciencefair',
    width: 1050,
    frame: false,
    fullscreen: false,
    icon: './icon/logo.png'
  })

  main.maximize()

  main.loadURL(path.join('file://', __dirname, '/app/index.html'))

  main.on('closed', function () {
    main = null
  })
})
