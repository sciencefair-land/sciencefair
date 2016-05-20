var css = require('dom-css')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var selection = require('d3-selection')
var yo = require('yo-yo')

var PaperRow = require('./paperrow.js')

inherits(Table, EventEmitter)

function Table (container, opts) {
  if (!(this instanceof Table)) return new Table(container, opts)
  var self = this

  var outer = container.appendChild(yo`<div></div>`)
  self.papers = []

  self.update = function (items) {
    self.papers = self.papers.concat(items)
    yo.update(outer, render(self.papers))
  }

  self.clear = function () {
    self.papers = []
    selection.selectAll('.paper-table-row').remove()
  }

  function render (data) {
    self.element = yo`
    <div class="results-table">
      ${tbody(data)}
    </div>
    `
    return self.element
  }

  function tbody (rows) {
    var element = yo`
    <div class="tbody">
      ${rows.map(renderRow)}
    </div>
    `

    return element

    function renderRow (paper) {
      var pr = PaperRow(paper, opts)
      ;['click', 'lens-click',
       'xml-click', 'pdf-click'].forEach(function(clicktype) {
        pr.on(clicktype, function() {
          self.emit(clicktype, pr)
        })
      })
      return pr.row
    }
  }
}

module.exports = Table
