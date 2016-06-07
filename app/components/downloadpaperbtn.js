var yo = require('yo-yo')
var css = require('dom-css')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter

inherits(DownloadPaperButton, EventEmitter)

function DownloadPaperButton (paper, opts) {
  if (!(this instanceof DownloadPaperButton)) return new DownloadPaperButton(paper, opts)
  var self = this

  function button (type) {
    var btn = yo`
    <div class="clickable"></div>
    `
    css(btn, {
      backgroundColor: 'rgb(43, 43, 51)',
      '-webkit-mask': `url(./images/${type}.svg) center / contain no-repeat`,
      display: 'block',
      height: '20%',
      padding: 0
    })

    return btn
  }

  var dlbtn = button('down_arrow')

  dlbtn.onclick = function () {
    paper.download(opts.fulltextSource.downloadPaperHTTP, self.load)
  }

  self.load = function () {
    self.emit('downloaded')
  }

  self.element = yo`
    ${dlbtn}
  `

  css(self.element, {
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center'
  })
}

module.exports = DownloadPaperButton
