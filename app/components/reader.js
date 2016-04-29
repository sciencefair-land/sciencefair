var css = require('dom-css')
var _ = require('lodash')
var fs = require('fs')
var path = require('path')

// TODO: emit events, 'close'

function Reader (paper) {
  if (!(this instanceof Reader)) return new Reader(paper)
  var self = this

  var frame = document.createElement('webview')
  frame.disablewebsecurity = true
  // frame.addEventListener("dom-ready", function(){
  //   frame.openDevTools();
  // });

  var closebtn = document.createElement('img')
  closebtn.src = './images/close.png'

  var margin = 0
  var marginTopShim = 30

  css(closebtn, {
    display: 'none',
    zIndex: 1001,
    width: 30,
    height: 30,
    position: 'fixed',
    right: margin + 5,
    top: margin + marginTopShim + 5
  })

  var encodedURL = encodeURIComponent(paper.url())
  frame.src = `./lib/lens/index.html?url=${encodedURL}`

  css(frame, {
    position: 'fixed',
    left: margin,
    top: margin + marginTopShim,
    bottom: margin,
    right: margin,
    zIndex: 1000,
    display: 'none'
  })

  self.show = function() {
    document.body.appendChild(frame)
    css(frame, 'display', 'block')
    document.body.appendChild(closebtn)
    css(closebtn, 'display', 'block')
  }

  self.destroy = function() {
    document.body.removeChild(frame)
    document.body.removeChild(closebtn)
    delete frame
    delete closebtn
  }

  closebtn.onclick = function() {
    self.destroy()
  }

}

module.exports = Reader
