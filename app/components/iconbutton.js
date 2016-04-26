var css = require('dom-css')
var yo = require('yo-yo')

module.exports = function (src, click) {
  var element = yo`
  <img src=${src} onclick=${click} />
  `
  css(element, {
    width: '20%',
    maxWidth: '30px'
  })

  return element
}
