var yo = require('yo-yo')
var css = require('dom-css')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var list = require('./list.js')
var table = require('./table.js')
var downloadbtn = require('./downloadbtn.js')

inherits(DisplayController, EventEmitter)

function DisplayController (container, opts) {
  if (!(this instanceof DisplayController)) return new DisplayController(container, opts)
  var self = this

  self.display = list(container, opts)

  function button(type) {
    var btn = yo`
    <div class="clickable"></div>
    `
    css(btn, {
      backgroundColor: 'rgb(43, 43, 51)',
      '-webkit-mask': `url(./images/${type}.svg) center / contain no-repeat`,
      display: 'flex',
      height: 40,
      width: 40,
      padding: 0,
      marginRight: 10
    })

    return btn
  }

  function bubbleClick (a, b, c) {
    self.emit('paper.click', a, b, c)
  }

  function cleanup(old) {
    old.clear()
    old.element.remove()
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

  listbtn.onclick = function() {
    if (self.display instanceof list) {
      return
    }

    css(tablebtn, inactivestyle)
    css(listbtn, activestyle)

    var old = self.display
    self.display = list(container, opts)
    self.display.update(old.papers)
    cleanup(old)

    self.display.on('click', bubbleClick)
  }

  tablebtn.onclick = function() {
    if (self.display instanceof table) {
      return
    }

    css(listbtn, inactivestyle)
    css(tablebtn, activestyle)

    var old = self.display
    self.display = table(container, opts)
    self.display.update(old.papers)
    cleanup(old)

    self.display.on('click', bubbleClick)
  }

  var dlbtn = downloadbtn(self, opts)

  self.update = function(items) {
    self.display.update(items)
    dlbtn.load()
  }

  self.clear = function() {
    self.display.clear()
  }

  self.element = yo`
  <div class="display-controller">
    ${listbtn}
    ${tablebtn}
    ${dlbtn.element}
  </div>
  `

  css(self.element, {
    display: 'flex',
    flexDirection: 'row',
    position: 'absolute',
    marginTop: '3.6%',
    left: 'calc(41% + 60px)'
  })

  container.appendChild(self.element)
}

module.exports = DisplayController
