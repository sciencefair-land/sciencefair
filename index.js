var app = require('app')
var browser = require('browser-window')

var main = null

app.on('ready', function () {
  main = new browser({
    height: 720,
    resizable: false,
    title: 'sciencefair',
    width: 1050,
    'title-bar-style': 'hidden',
    fullscreen: false
  })

  main.loadURL('file://' + __dirname + '/app/index.html')

  main.on('closed', function () {
    main = null
  })
})