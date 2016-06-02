var css = require('dom-css')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var selection = require('d3-selection')
var yo = require('yo-yo')

var PaperBox = require('./paperbox.js')

inherits(List, EventEmitter)

function List (container, opts) {
  if (!(this instanceof List)) return new List(container, opts)
  var self = this

  self.element = container.appendChild(yo`<div></div>`)
  self.papers = []

  self.update = function (items) {
    self.papers = self.papers.concat(items)
    render(self.papers)
  }

  self.clear = function () {
    self.papers = []
    selection.selectAll('.paper-box').remove()
  }

  function render (data) {
    var element = yo`
    <div class="results-list">
      ${data.map(renderBox)}
    </div>
    `
    css(element, {
      maxHeight: '100%',
      position: 'relative',
      marginTop: 50,
      marginLeft: 30,
      overflowY: 'scroll'
    })

    yo.update(self.element, element)
  }

  function renderBox (paper) {
    var pb = PaperBox(paper, opts)
    pb.on('click', function () {
      self.emit('click', pb)
    })
    return pb.box
  }
}

module.exports = List
