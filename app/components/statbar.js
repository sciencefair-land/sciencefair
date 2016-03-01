var css = require('dom-css')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter

inherits(Statbar, EventEmitter)

function Statbar (container) {
  if (!(this instanceof Statbar)) return new Statbar(container)
  var self = this

  var box = container.appendChild(document.createElement('div'))
  css(box,{
    margin: 0,
    paddingLeft: '30px',
    color: 'rgb(202,172,77)',
    display: 'flex',
    alignItems: 'center'
  })

  var speed = box.appendChild(document.createElement('div'))
  speed.innerHTML = 0 + ' mb/s'

  css(speed, {
    marginRight: '40px',
    fontFamily: 'CooperHewitt-Light',
  })

  self.update = function (value) {
    speed.innerHTML = value + ' mb/s'
  }

}

module.exports = Statbar
