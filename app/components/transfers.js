var css = require('dom-css')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter

inherits(Transfers, EventEmitter)

function Transfers (container) {
  if (!(this instanceof Transfers)) return new Transfers(container)
  var self = this

  var box = container.appendChild(document.createElement('div'))
  css(box,{
    marginLeft: '5%',
    marginTop: '2%',
    color: 'rgb(202,172,77)'
  })

  var speed = box.appendChild(document.createElement('div'))
  speed.innerHTML = 0 + ' mb/s'

  css(speed, {
    width: '100%',
    left: '0%',
    width: '6%',
    fontFamily: 'CooperHewitt-Light',
    textAlign: 'right'
  })

  self.update = function (value) {
    speed.innerHTML = value + ' mb/s'
  }

}

module.exports = Transfers