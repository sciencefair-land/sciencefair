var css = require('dom-css')
var _ = require('lodash')
var fs = require('fs')
var path = require('path')

// TODO: emit events, 'close'

function Reader (paper) {
  if (!(this instanceof Reader)) return new Reader(paper)
  var self = this

  var encloser = document.createElement('div')
  var frame = encloser.appendChild(document.createElement('webview'))
  frame.disablewebsecurity = true
  frame.addEventListener("dom-ready", function () {
    // uncomment line below if you want to debug the lens reader
    // frame.openDevTools()
  })
  frame.shadowRoot.applyAuthorStyles = true
  frame.shadowRoot.children[1].style.cssText = "width: 100%; height: 100%"

  var closebtn = document.createElement('img')
  closebtn.src = './images/close.png'

  var margin = 0
  var marginTopShim = 30

  css(closebtn, {
    display: 'none',
    zIndex: 3001,
    width: 30,
    height: 30,
    position: 'fixed',
    right: margin + 5,
    top: margin + marginTopShim + 5
  })

  var xmlfiles = paper.assetPaths().filter(function (path) {
    return /xml/.test(path)
  })
  var xmlfile = xmlfiles[xmlfiles.length - 1]
  xmlfile = path.parse(xmlfile)
  var encodedURL = encodeURIComponent(paper.assetUrl(xmlfile.base))
  frame.src = `./lib/lens/index.html?url=${encodedURL}`

  css(encloser, {
    position: 'fixed',
    left: margin,
    top: margin + marginTopShim,
    bottom: margin,
    right: margin,
    zIndex: 3000,
    display: 'none',
    border: 'none'
  })

  css(frame, {
    width: '100%',
    height: '100%',
    display: 'block'
  })

  self.show = function() {
    document.body.appendChild(encloser)
    css(encloser, 'display', 'block')
    document.body.appendChild(closebtn)
    css(closebtn, 'display', 'block')
  }

  self.destroy = function() {
    document.body.removeChild(encloser)
    document.body.removeChild(closebtn)
    delete frame
    delete closebtn
  }

  closebtn.onclick = function() {
    self.destroy()
  }

}

module.exports = Reader
