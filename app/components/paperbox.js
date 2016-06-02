var css = require('dom-css')
var inherits = require('inherits')
var _ = require('lodash')
var EventEmitter = require('events').EventEmitter
var reader = require('../lib/reader.js')
var DownloadPaperBtn = require('./downloadpaperbtn.js')

inherits(PaperBox, EventEmitter)

function PaperBox (paper, opts) {
  if (!(this instanceof PaperBox)) return new PaperBox(paper, opts)
  var self = this
  self.paper = paper
  self.opts = opts

  var downloadPaper = DownloadPaperBtn(paper, opts)

  var box = document.createElement('div')
  box.className = 'paper paper-box clickable'
  var title = box.appendChild(document.createElement('div'))
  var author = box.appendChild(document.createElement('div'))
  var year = box.appendChild(document.createElement('div'))
  var overlay = box.appendChild(document.createElement('div'))
  var lens = overlay.appendChild(document.createElement('img'))
  var downloadBtn = overlay.appendChild(downloadPaper.element)
  var bar = box.appendChild(document.createElement('div'))
  lens.src = './images/lens.png'

  self.pmcid = self.paper.getId('pmcid')

  title.innerHTML = self.paper.title
  author.innerHTML = self.paper.etalia()
  year.innerHTML = self.paper.year

  var lensReader = null

  var base = {
    position: 'absolute',
    fontFamily: 'Aleo-Regular',
    textAlign: 'left',
    color: 'rgb(178,180,184)'
  }

  css(box, {
    position: 'relative',
    background: 'rgb(43,43,51)',
    display: 'inline-block',
    marginRight: '20px',
    marginBottom: '20px',
    cursor: 'pointer'
  })

  css(bar, {
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 999,
    width: '0%',
    height: 7,
    display: 'block',
    backgroundColor: 'rgb(202, 172, 77)'
  })

  css(overlay, {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    display: 'none',
    background: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center'
  })

  var hasFulltextDownloaded = paper.assetPathByFilename('fulltext.xml')
  css(lens, {
    width: '20%',
    display: hasFulltextDownloaded ? 'block' : 'none'
  })

  css(downloadBtn, {
    width: '20%',
    display: hasFulltextDownloaded ? 'none' : 'block'
  })

  self.layout = function () {

    var width = '160'

    css(box, {
      width: width + 'px',
      height: width * 1.31,
      padding: width * 0.09
    })

    css(title, _.extend(_.clone(base), {
      fontSize: '14px',
      left: '10px',
      right: '10px',
      top: '10px',
      bottom: '40px',
      overflowY: 'scroll',
      overflowX: 'hidden'
    }))

    css(author, _.extend(_.clone(base), {
      fontSize: '10px',
      left: '10px',
      right: '40px',
      bottom: '10px'
    }))

    css(year, _.extend(_.clone(base), {
      position: 'absolute',
      fontSize: '14px',
      left: '120px',
      right: '10px',
      bottom: '10px'
    }))

  }

  self.updateBar = function (done, total) {
    css(bar, { width: `${Math.min((done / total) * 100, 100)}%`})
  }

  self.downloadFailed = function (err) {
    css(bar, {
      width: '100%',
      backgroundColor: 'rgb(202,77,107)'
    })
  }

  self.downloaded = function () {
    css(lens, {
      display: 'block'
    })

    css(downloadBtn, {
      display: 'none'
    })
  }

  self.layout()
  //
  // self.updateBar(0, 9999)
  // self.loadFile()

  box.onclick  = function () {
    self.emit('click')
  }

  box.addEventListener("mouseenter", function(event) {
    if (self.paper && contentServer.port) css(overlay, { display: 'flex' })
  })

  box.addEventListener("mouseleave", function(event) {
    css(overlay, { display: 'none' })
  })

  lens.onclick = function () {
    self.emit('lens-click')
    lensReader = reader(self.paper, self.opts)
    lensReader.show()
    // TODO: destroy on close
  }

  downloadPaper.on('downloaded', self.downloaded)

  self.box = box
}

module.exports = PaperBox
