var css = require('dom-css')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var selection = require('d3-selection')
var Paper = require('./paper.js')

inherits(List, EventEmitter)

function List (container) {
  if (!(this instanceof List)) return new List(container)
  var self = this

  var list = container.appendChild(document.createElement('div'))

  css(list,{
    position: 'absolute',
    top: '18%',
    left: '5%',
    width: '90%',
    height: '77.2%',
    overflowY: 'scroll'
  })

  self.clear = function () {
    selection.selectAll('.paper').remove()
  }

  self.update = function (items) {
    items.forEach(function (item) {
      var paper = Paper(list)
      paper.update(item)
      paper.on('click', function () {
        self.emit('click', paper)
      })
    })
  }

}

module.exports = List
