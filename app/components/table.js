var css = require('dom-css')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var selection = require('d3-selection')
var PaperRow = require('./paperrow.js')

// var objectAssign = require('object-assign')
var yo = require('yo-yo')
var csjs = require('csjs')

inherits(Table, EventEmitter)

function Table (container, opts) {
  if (!(this instanceof Table)) return new Table(container, opts)
  var self = this

  self.clear = function () {
    selection.selectAll('.paper-table-row').remove()
  }

  var outer = container.appendChild(yo`<div></div>`)

  self.update = function (items) {
    yo.update(outer, render(items))
  }

  function render (data) {
    return yo`
    <div class="results-table">
      ${thead()}
      ${tbody(data)}
    </div>
    `
  }

  function thead (row) {
    return yo`
    <div class="thead">
      <div class="row">
        <div class="th col-title">Title</div>
        <div class="th col-author">Author</div>
        <div class="th col-year">Year</div>
        <div class="th col-pmcid">PMCid</div>
        <div class="th col-doi">DOI</div>
      </div>
    </div>
    `
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
      pr.on('click', function(a, b, c) {
        self.emit('click', a, b, c)
      })
      return pr.row
    }

  }
}

module.exports = Table
