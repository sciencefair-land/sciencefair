var css = require('dom-css')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var yo = require('yo-yo')

inherits(Main, EventEmitter)

function Main (container) {
  if (!(this instanceof Main)) return new Main(container)
  var self = this

  self.element = container.appendChild(yo`
    <div id="main"></div>`)
  css(self.element, {
    margin: 0,
    width: '100%',
    height: '100%',
    paddingLeft: 30,
    paddingRight: 30,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgb(111,174,193)',
    position: 'relative',
    marginBttom: 60
  })
}

module.exports = Main
