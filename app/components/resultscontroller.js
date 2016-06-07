var yo = require('yo-yo')
var css = require('dom-css')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var list = require('./list.js')

inherits(ResultsController, EventEmitter)

function ResultsController (container, opts) {
  if (!(this instanceof ResultsController)) return new ResultsController(container, opts)
  var self = this

  self.barelement = yo`<div></div>`
  self.element = yo`<div>${self.barelement}</div>`
  css(self.element, {
    marginBottom: 64,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  })
  container.appendChild(self.element)

  self.display = list(self.element, opts)

  self.opts = opts

  self.clear = function () {
    self.display.clear()
  }

  self.update = function (items) {
    self.display.update(items)
  }

  var barelement = yo`
  <div class="display-controller">
  </div>
  `

  css(barelement, {
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    marginTop: '3.2%',
    marginLeft: 'calc(41% + 60px)',
    height: 50
  })

  yo.update(self.barelement, barelement)
}

module.exports = ResultsController
