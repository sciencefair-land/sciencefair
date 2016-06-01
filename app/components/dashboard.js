var yo = require('yo-yo')
var css = require('dom-css')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var fs = require('fs')
var path = require('path')

inherits(Dashboard, EventEmitter)

function Dashboard (container, opts) {
  if (!(this instanceof Dashboard)) return new Dashboard(container, opts)
  var self = this

  self.opts = opts

  var blocksPath = path.join(__dirname, 'dashboard')
  self.blocks = fs.readdirSync(blocksPath).map(function (file) {
    console.log(path.join(blocksPath, file))
    try {
      return require(path.join(blocksPath, file))()
    } catch (err) {
      console.trace(err)
    }
  })

  self.papers = []
  self.hidden = true
  self.element = yo`<div id="dashboard" class="grid"></div>`

  function render () {
    var element = yo`
    <div id="dashboard" class="grid">
      ${self.blocks.map(renderBlock)}
    </div>
    `
    css(element, {
      display: self.hidden ? 'none' : 'flex',
      width: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      position: 'relative',
      margin: '0 30px',
      marginTop: 40
    })

    self.element = yo.update(self.element, element)
  }

  function renderBlock (block) {
    return block.element
  }

  self.update = function (papers) {
    self.papers = papers
    self.blocks.forEach(function (block) {
      try {
        block.update(papers)
      } catch (err) {
        console.trace(err)
      }
    })
    render()
  }

  self.clear = function () {
    self.papers = []
    self.blocks.forEach(function (block) { block.clear() })
  }

  self.toggle = function () {
    self.hidden = !(self.hidden)
    css(self.element, 'display', self.hidden ? 'none' : 'flex')
    self.blocks.forEach(function (block) { block.updateDisplay() })
  }

  render()

  container.appendChild(self.element)
}

module.exports = Dashboard
