var css = require('dom-css')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter

inherits(Main, EventEmitter)

function Main (container) {
  if (!(this instanceof Main)) return new Main(container)
  var self = this

  var box = container.appendChild(document.createElement('div'))
  css(box, {
    margin: 0,
    width: '100%',
    height: '100%',
    paddingLeft: 30,
    paddingRight: 30,
    display: 'flex',
    backgroundColor: 'rgb(111,174,193)',
    position: 'relative'
  })

  self.element = box
}

module.exports = Main
