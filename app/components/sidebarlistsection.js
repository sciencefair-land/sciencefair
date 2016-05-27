var css = require('dom-css')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var yo = require('yo-yo')

inherits(SidebarListSection, EventEmitter)

function SidebarListSection (title, entries, container) {
  if (!(this instanceof SidebarListSection)) {
    return new SidebarListSection(title, container)
  }
  var self = this

  self.entries = entries

  function render () {
    var element = yo`
    <div id="sidebar-section">
      <h1 class="sidebar-section-title">${title}</h1>
      ${self.entries}
    </div>
    `

    css(element, {
      margin: 0,
      height: 'auto',
      widht: '100%',
      display: 'flex',
      position: 'relative',
      borderBottom: 'dotted rgb(178, 180, 184) 2px',
      transitionDuration: '0.5s'
    })

    if (self.element) {
      yo.update(self.element, element)
    } else {
      self.element = element
    }
  }

  self.addEntry = function (entry) {
    self.entries.push(entry)
    render()
  }

  self.removeEntry = function (entry) {
    var i = self.entries.indexOf(entry)
    if (i > -1) {
      self.entries.splice(i, 1)
    }
    render()
  }

  render()
  container.appendChild(self.element)
}

module.exports = SidebarListSection
