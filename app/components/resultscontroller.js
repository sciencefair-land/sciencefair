var yo = require('yo-yo')
var css = require('dom-css')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var list = require('./list.js')
var table = require('./table.js')
var downloadbtn = require('./downloadbtn.js')

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

  self.display = { papers: [] }

  self.opts = opts

  function button (type) {
    var btn = yo`
    <div></div>
    `
    css(btn, {
      backgroundColor: 'rgb(43, 43, 51)',
      '-webkit-mask': `url(./images/${type}.svg) center / contain no-repeat`,
      display: 'flex',
      height: 50,
      width: 50,
      padding: 0,
      marginRight: 10,
      marginLeft: 5,
      cursor: 'pointer',
      opacity: 1.0
    })

    return btn
  }

  function bubbleClick (a, b, c) {
    self.emit('paper.click', a, b, c)
  }

  function cleanup (old) {
    old.clear()
    if (old.element) {
      self.element.removeChild(old.element)
    }
  }

  var activestyle = {
    opacity: 0.85
  }

  var inactivestyle = {
    opacity: 0.4
  }

  var listbtn = button('list')
  var tablebtn = button('table')
  css(tablebtn, inactivestyle)

  listbtn.onclick = function () {
    if (self.display instanceof list) {
      return
    }

    css(tablebtn, inactivestyle)
    css(listbtn, activestyle)

    var old = self.display
    self.display = list(self.element, opts)
    self.display.update(old.papers)
    cleanup(old)

    self.display.on('click', bubbleClick)
  }

  tablebtn.onclick = function () {
    if (self.display instanceof table) {
      return
    }

    css(listbtn, inactivestyle)
    css(tablebtn, activestyle)

    var old = self.display
    self.display = table(self.element, opts)
    self.display.update(old.papers)
    cleanup(old)

    self.display.on('click', bubbleClick)
  }

  var dlbtn = downloadbtn(self, opts)

  var dashboard = require('./dashboard.js')(self.element, opts)

  self.display = list(self.element, opts)

  self.clear = function () {
    self.display.clear()
    dashboard.clear()
  }

  var dashbtn = button('dashboard')
  css(dashbtn, inactivestyle)

  dashbtn.onclick = function () {
    css(dashbtn, dashboard.hidden ? activestyle : inactivestyle)
    dashboard.toggle()
  }

  self.update = function (items) {
    self.display.update(items)
    dashboard.update(items)
    dlbtn.load()
  }

  var barelement = yo`
  <div class="display-controller">
    <div class='button-wrapper' data-hint='grid view'>
      <div class='clickable'>${listbtn}</div>
    </div>
    <div class='button-wrapper' data-hint='list view'>
      <div class='clickable'>${tablebtn}</div>
    </div>
    <div class='button-wrapper' data-hint='download all'>${dlbtn.element}</div>
    <div class='button-wrapper' data-hint='toggle dashboard'>${dashbtn}</div>
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
