var css = require('dom-css')
var inherits = require('inherits')
var _ = require('lodash')
var EventEmitter = require('events').EventEmitter
var yo = require('yo-yo')
var d3 = require('d3')
var nv = require('nvd3')

inherits(YearsPlot, EventEmitter)

function YearsPlot () {
  if (!(this instanceof YearsPlot)) return new YearsPlot()
  var self = this

  self.years = {}

  var svg = yo`<svg></svg>`
  css(svg, {
    display: 'block',
    margin: 0,
    height: '100%',
    width: '100%'
  })

  var inner = yo`<div id="block-year-barplot">${svg}</div>`
  css(inner, {
    margin: 0,
    height: 270,
    marginTop: -30
  })

  self.element = yo `<div class="dashboard-block">
    <div class="dashboard-block-title">Papers per year
    </div>
    ${inner}
  </div>`

  function loadData (papers) {
    papers.forEach(function (paper) {
      var n = self.years[paper.year] || 0
      self.years[paper.year] = n + 1
    })
    var years = _.toPairs(self.years)
      .map(function (pair) {
        return _.parseInt(pair[0])
      })
    var min = _.min(years)
    var max = _.max(years)
    for (var year = min; year < max + 1; year++) {
      if (!(self.years[year])) {
        self.years[year] = 0
      }
    }
  }

  function parseData () {
    var data = _.toPairs(self.years)
      .map(function (pair) {
        return [_.parseInt(pair[0]), pair[1]]
      })
      .sort(function (b, a) {
        a = a[0]
        b = b[0]
        if (a > b) {
          return -1
        } else if (b > a) {
          return 1
        }
        return 0
      })
    return [
      {
        key: 'Papers per Year',
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
      self.chart = nv.models.discreteBarChart()
        .x(function (d) { return d.label })
        .y(function (d) { return d.value })
        .duration(250)
        .margin({top: 40, right: 0, bottom: 50, left: 35})

      self.chart.xAxis
        .tickFormat(d3.format('.0f'))
        .rotateLabels(-45)
        .tickFormat(function (d, i) {
          // show a maximum of 8 labels
          // skip every floor(n / 8) labels
          var by = 1
          if (data[0].values.length > 8) {
            by = Math.floor(data[0].values.length / 8)
          }
          return i % by === 0 ? d : ''
        })

      self.chart.yAxis
        .tickValues(_.range(min, max + 1))
        .tickFormat(d3.format('.0f'))

      self.chart.showXAxis(true)

      d3.select('#block-year-barplot svg')
        .datum(parseData())
        .call(self.chart)
        .selectAll('rect.discreteBar')
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
    self.years = {}
    self.update([])
  }
}

module.exports = YearsPlot
