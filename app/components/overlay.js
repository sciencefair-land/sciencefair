var yo = require('yo-yo')
var css = require('dom-css')

module.exports = function () {
  var overlay = yo`
  <div class="overlay">
  </div>
  `
  css(overlay, {
    display: 'flex',
    position: 'absolute'
    top: 50,
    left: 0,
    right: 0,
    bottom: 50
  })

  return overlay
}
