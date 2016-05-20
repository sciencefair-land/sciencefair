var css = require('dom-css')
var yo = require('yo-yo')

module.exports = function (src, click) {
  var element = yo`
  <img class="clickable" onclick=${click} />
  `
  css(element, {
    width: 40,
    height: 40,
    background: 'rgb(178, 180, 184)',
    '-webkit-mask': `url(${src}) center / contain no-repeat`,
    display: 'flex'
  })

  return element
}
