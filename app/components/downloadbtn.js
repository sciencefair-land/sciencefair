var yo = require('yo-yo')
var css = require('dom-css')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var list = require('./list.js')
var table = require('./table.js')

inherits(DownloadButton, EventEmitter)

function DownloadButton (controller, opts) {
  if (!(this instanceof DownloadButton)) return new DownloadButton(controller, opts)
  var self = this

  self.allDownloaded = false

  function button(type) {
    var btn = yo`
    <div class="clickable"></div>
    `
    css(btn, {
      backgroundColor: 'rgb(43, 43, 51)',
      '-webkit-mask': `url(./images/${type}.svg) center / contain no-repeat`,
      display: 'flex',
      position: 'absolute',
      height: 40,
      width: 40,
      padding: 0,
      margin: 0,

    })

    return btn
  }

  function icon(type) {
    var icon = yo`
    <div></div>
    `
    css(icon, {
      backgroundColor: 'rgb(111, 174, 193)',
      '-webkit-mask': `url(./images/${type}.svg) center / contain no-repeat`,
      display: 'flex',
      width: 15,
      height: 15,
      marginTop: 20,
      marginLeft: 31,
      transformOrigin: 'center bottom'
    })

    return icon
  }

  var inactiveStyle = {
    display: 'flex',
    opacity: 1.0,
    backgroundColor: 'rgb(111, 174, 193)'
  }

  var activeStyle = {
    display: 'flex',
    opacity: 1.0,
    backgroundColor: 'rgb(202, 172, 77)'
  }

  var hiddenStyle = {
    display: 'none',
    animation: 'none'
  }

  var dropStyle = {
    animation: 'icon-drop 1s 0s infinite ease'
  }

  var dlbtn = button('download_all')
  css(dlbtn, {
    marginLeft: 10,
    width: 59
  })

  var arrow = icon('down_arrow')
  css(arrow, inactiveStyle)
  var tick = icon('tick')
  css(tick, hiddenStyle)
  css(tick, {
    width: 21,
    height: 21,
    marginLeft: 28,
    marginTop: 10
  })

  function reset () {
    css(arrow, inactiveStyle)
    css(tick, hiddenStyle)
  }

  function downloading () {
    css(arrow, activeStyle)
    css(arrow, dropStyle)
    css(tick, hiddenStyle)
  }

  function allDownloaded () {
    css(arrow, hiddenStyle)
    css(tick, activeStyle)
  }

  dlbtn.onclick = function () {
    downloading()
    var done = _.after(controller.display.papers.length, self.load)
    controller.display.papers.forEach(function (paper, i) {
      setTimeout(function () {
        paper.download(opts.fulltextSource.downloadPaperHTTP, done)
      }, i * 300)
    })
  }

  self.load = function () {
    var n = controller.display.papers.length
    if (n === 0) return reset()
    var downloaded = 0
    controller.display.papers.forEach(function (paper) {
      if (paper.downloaded) {
        downloaded += 1
      }
    })
    if (downloaded === n) {
      allDownloaded()
    } else {
      reset()
    }
  }

  self.load()

  self.element = yo`
  <div class="download-btn">
    ${dlbtn}
    ${arrow}
    ${tick}
  </div>
  `

  setInterval(self.load, 2000)

  css(self.element, {
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center'
  })
}

module.exports = DownloadButton
