var css = require('dom-css')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter

inherits(Search, EventEmitter)

function Search (container) {
  if (!(this instanceof Search)) return new Search(container)
  var self = this

  var input = container.appendChild(document.createElement('input'))
  var img = container.appendChild(document.createElement('img'))
  input.autofocus = true
  img.width = '25'
  img.height = '25'
  img.src = './images/search.svg'

  var buttons = container.appendChild(document.createElement('div'))

  var prev = buttons.appendChild(document.createElement('div'))
  prev.textContent = "⬆"
  var next = buttons.appendChild(document.createElement('div'))
  next.textContent = "⬇"

  css(img, {
    position: 'absolute',
    marginTop: 'calc(4% + 2px)',
    marginLeft: 'calc(5% + 2px)',
    zIndex: 2000,
    display: 'none'
  })

  css(input,{
    position: 'absolute',
    marginTop: '4%',
    marginLeft: '5%',
    width: '36%',
    height: '30px',
    border: 'none',
    borderBottom: 'dotted 2px rgb(33,33,39)',
    fontSize: '130%',
    paddingLeft: '35px',
    paddingBottom: '5px',
    fontFamily: 'CooperHewitt-Book',
    background: 'none',
    display: 'none'
  })

  css(buttons, {
    position: 'absolute',
    marginTop: '4%',
    right: '5%',
    border: 'none',
    fontSize: '130%',
    paddingBottom: '5px',
    fontFamily: 'CooperHewitt-Book'
  })

  var buttonStyle = {
    transform: 'rotate(-90deg)',
    color: 'rgb(202,172,77)',
    background: 'rgb(33,33,39)',
    padding: '3px',
    marginLeft: '20px'
  }

  css(prev, buttonStyle)
  css(next, buttonStyle)

  input.onfocus = function () {
    css(input, {
      outline: 'none'
    })
  }

  input.onblur = function () {
    css(input, {
      outline: 'none'
    })
  }

  input.oninput = function () {
    self.emit('input', input.value)
  }

  prev.onclick = function () {
    self.emit('prev')
  }

  next.onclick = function () {
    self.emit('next')
  }

  self.showSearch = function () {
    css(img, { display: 'block' })
    css(input, { display: 'block' })
  }

  self.hideButtons = function () {
    css(prev, { display: 'none' })
    css(next, { display: 'none' })
  }

  self.showButtons = function () {
    css(prev, { display: 'inline-block' })
    css(next, { display: 'inline-block' })
  }

  self.updateButtons = function(stats) {
    var first = stats.from == 0
    var mid = !first && stats.to < stats.total
    var last = stats.to >= stats.total
    if (first) {
      css(prev, { display: 'none' })
      css(next, { display: 'block' })
    } else if (mid) {
      search.showButtons()
    } else if (last) {
      css(prev, { display: 'block' })
      css(next, { display: 'none' })
    }
  }

  self.hideButtons()

}

module.exports = Search
