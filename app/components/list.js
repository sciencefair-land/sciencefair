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

  var outer = container.appendChild(yo`<div></div>`)
  self.papers = []

  self.update = function (items) {
    self.papers = self.papers.concat(items)
    yo.update(outer, render(self.papers))
  }

  self.clear = function () {
    self.papers = []
    selection.selectAll('.paper-box').remove()
  }

  function render (data) {
    self.element = yo`
    <div class="results-list">
      ${data.map(renderBox)}
    </div>
    `
    css(self.element, {
      position: 'absolute',
      top: 'calc(4% + 100px)',
      left: '5%',
      width: '90%',
      height: 'calc(96% - 140px)',
      overflowY: 'scroll'
    })

    return self.element
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
