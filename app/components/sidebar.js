var css = require('dom-css')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var yo = require('yo-yo')

inherits(Sidebar, EventEmitter)

function Sidebar (container) {
  if (!(this instanceof Sidebar)) return new Sidebar(container)
  var self = this

  var fullwidth = 400
  var minwidth = 60

  self.sections = []

  function button (type) {
    var element = yo`
    <div class="clickable"></div>
    `
    css(element, {
      backgroundColor: 'rgb(178, 180, 184)',
      '-webkit-mask': `url(./images/${type}.svg) center / contain no-repeat`,
      display: 'flex',
      height: 30,
      width: 30,
      padding: 5,
      cursor: 'pointer',
      opacity: 0.85,
      position: 'absolute',
      top: 10,
      right: 10,
      transform: 'rotate(180deg)',
      transitionDuration: '0.2s'
    })

    return element
  }

  var togglebtn = button('open_sidebar')

  togglebtn.onclick = function () {
    if (self.collapsed) {
      self.expand()
      css(togglebtn, 'transform', 'rotate(180deg)')
    } else {
      self.collapse()
      css(togglebtn, 'transform', 'rotate(0deg)')
    }
  }

  function render () {
    var element = yo`
    <div id="sidebar">
      ${self.sections}
    </div>
    `

    css(element, {
      margin: 0,
      width: fullwidth,
      height: 'calc(100% - 58px)',
      display: 'flex',
      position: 'relative',
      flexDirection: 'column',
      borderBottom: '',
      borderTop: '',
      transitionDuration: '0.5s',
      paddingTop: 50
    })

    if (self.element) {
      yo.update(self.element, element)
    } else {
      self.element = element
    }
  }

  self.collapsed = false

  self.collapse = function () {
    css(self.element, 'width', minwidth)
    self.collapsed = true
  }

  self.expand = function () {
    css(self.element, 'width', fullwidth)
    self.collapsed = false
  }

  self.addSection = function (section) {
    self.sections.push(section)
    render()
  }

  render()

  container.appendChild(self.element)
}

module.exports = Sidebar
