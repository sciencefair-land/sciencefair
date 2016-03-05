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
    width: '100%',
    paddingLeft: '30px',
    paddingRight: '30px',
    color: 'rgb(202,172,77)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  })

  var speed = box.appendChild(document.createElement('div'))
  var dbname = box.appendChild(document.createElement('div'))

  css(speed, {
    marginRight: '40px',
    fontFamily: 'CooperHewitt-Light',
  })

  css(dbname, {
    marginLeft: '40px',
    fontFamily: 'CooperHewitt-Light',
  })

  self.updateSpeed = function (value) {
    speed.innerHTML = value + ' mb/s'
  }

  self.setdb = function (db) {
    dbname.innerHTML = 'database: ' + db.name
  }

  self.updateSpeed(0)

}

module.exports = Statbar
