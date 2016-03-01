var app = require('app')
var browser = require('browser-window')

var main = null

app.on('ready', function () {
  main = new browser({
    height: 720,
    resizable: true,
    title: 'sciencefair',
    width: 1050,
    'title-bar-style': 'hidden',
    fullscreen: false,
    icon: './app/images/logo.png'
  })

  main.loadURL('file://' + __dirname + '/app/index.html')

  main.on('closed', function () {
    main = null
  })
})
