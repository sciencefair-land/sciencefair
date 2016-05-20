var css = require('dom-css')
var yo = require('yo-yo')

module.exports = function (buttons) {
  var element = yo`
  <div class="button-bar">
    ${buttons.map(function(button) {
      return yo`<div>${button}</div>`
    })}
  </div>
  `
  css(element, {
    width: 'auto',
    height: 40,
    padding: 2,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
    alignContent: 'center'
  })

  return element
}
