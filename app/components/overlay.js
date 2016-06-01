var yo = require('yo-yo')
var css = require('dom-css')

module.exports = function (content) {

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
    top: margin + marginTopShim + 5,
    backgroundColor: 'white'
  })

  css(content, {
    position: 'fixed',
    left: margin,
    top: margin + marginTopShim,
    bottom: margin,
    right: margin,
    zIndex: 3000,
    display: 'none',
    border: 'none',
    backgroundColor: 'white',
    alignItems: 'center',
    flexDirection: 'row',
    overflowY: 'scroll'
  })

  function show () {
    document.body.appendChild(content)
    css(content, 'display', 'flex')
    document.body.appendChild(closebtn)
    css(closebtn, 'display', 'block')
  }

  function destroy () {
    document.body.removeChild(content)
    document.body.removeChild(closebtn)
  }

  closebtn.onclick = function () {
    destroy()
  }

  show()
}
