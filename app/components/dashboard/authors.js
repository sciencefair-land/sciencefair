var css = require('dom-css')
var inherits = require('inherits')
var _ = require('lodash')
var EventEmitter = require('events').EventEmitter
var yo = require('yo-yo')
var d3 = require('d3')
var nv = require('nvd3')

inherits(AuthorsPlot, EventEmitter)

function AuthorsPlot () {
  if (!(this instanceof AuthorsPlot)) return new AuthorsPlot()
  var self = this

  self.authors = {}

  var svg = yo`<svg></svg>`
  css(svg, {
    display: 'block',
    margin: 0,
    height: '100%',
    width: '100%'
  })

  var inner = yo`<div id="block-author-barplot">${svg}</div>`
  css(inner, {
    margin: 0,
    height: 270,
    marginTop: -30
  })

  self.element = yo `<div class="dashboard-block">
    <div class="dashboard-block-title">Papers per author
    <div class="dashboard-block-subtitle">top 10</div>
    </div>
    ${inner}
  </div>`

  function loadData (papers) {
    papers.forEach(function (paper) {
      paper.author.map(function (author) {
        return `${author.given_names} ${author.surname}`
      }).forEach(function (author) {
        var n = self.authors[author] || 0
        self.authors[author] = n + 1
      })
    })
  }

  function parseData () {
    var data = _.toPairs(self.authors)
      .filter(function (a) {
        // exclude papers with no author
        return !(a[0] === ' ')
      })
      .sort(function (a, b) {
        a = a[1]
        b = b[1]
        if (a > b) {
          return -1
        } else if (b > a) {
          return 1
        }
        return 0
      })
      .slice(0, 10)
    return [
      {
        values: data.map(function (d) {
          return {
            label: d[0],
            value: d[1]
          }
        })
      }
    ]
  }

  self.update = function (papers) {
    loadData(papers)
    self.chart = null
    var data = parseData()
    var min = _.minBy(data[0].values, function (d) { return d.value })
    var max = _.maxBy(data[0].values, function (d) { return d.value })

    nv.addGraph(function () {
      self.chart = nv.models.multiBarHorizontalChart()
        .x(function (d) { return d.label })
        // .rotateLabels(-45)
        .y(function (d) { return d.value })
        .showControls(false)
        .showValues(false)
        .duration(250)
        .margin({top: 0, right: 10, bottom: 20, left: 110})

      self.chart.yAxis
        .tickFormat(d3.format('.0f'))
        .tickValues(_.range(min, max + 1))

      self.chart.xAxis
        .tickFormat(function (d) {
          var parts = d.split(' ')
          return `${parts[0].charAt(0)} ${parts[parts.length - 1]}`
        })

      self.chart.tooltip(function (key, y, e, graph) {
        return 'haro <h3>' + key + ':</h3>' + '<p>' + y + '</p>'
      })

      d3.select('#block-author-barplot svg')
        .datum(data)
        .call(self.chart)
        .selectAll('.nv-bar')
          .style('fill', 'rgb(178, 180, 184)')
          .style('stroke', 'rgb(178, 180, 184)')

      nv.utils.windowResize(self.chart.update)

      return self.chart
    })
  }

  self.updateDisplay = function () {
    if (self.chart) {
      self.chart.update()
    }
  }

  self.clear = function () {
    self.authors = {}
    self.update([])
  }
}

module.exports = AuthorsPlot
