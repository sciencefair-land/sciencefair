var yo = require('yo-yo')
var css = require('dom-css')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter

inherits(Loading, EventEmitter)

function Loading (style) {
  var self = this
  if (!(this instanceof Loading)) return new Loading(style)

  // TODO: move the css inside here
  var color = 'rgb(202, 172, 77)'

  function bar(i) {
    var rect = yo`
    <div></div>
    `
    css(rect, {
      backgroundColor: color,
      marginRight: 3,
      animation: `line-scale 1s -0.${i - 1}s infinite cubic-bezier(0.2, 0.68, 0.18, 1.08)`
    })
    return rect
  }

  self.element = yo`
  <div class="line-scale">
    ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(bar)}
  </div>
  `

  if (style) css(self.element, style)

  self.show = function() {
    css(self.element, 'display', 'flex')
  }

  self.hide = function() {
    css(self.element, 'display', 'none')
  }

}

module.exports = Loading
