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
  var boxStyle = {
    borderRight: 'dotted rgb(43, 43, 51) 2px',
    display: 'inline-block'
  }

  var group = {}

  ;['first', 'prev', 'next', 'last'].forEach(function (name) {
    var box = buttons.appendChild(document.createElement('div'))
    css(box, boxStyle)
    var wrapper = box.appendChild(document.createElement('div'))
    wrapper.className = 'clickable'
    var icon = wrapper.appendChild(document.createElement('img'))
    icon.className = 'search-btn'
    group[name] = icon
  })

  css(img, {
    position: 'absolute',
    marginTop: 'calc(4% + 2px)',
    marginLeft: 'calc(5% + 2px)',
    zIndex: 900,
    display: 'none'
  })

  css(input, {
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
    marginTop: '3.5%',
    right: '5%',
    border: 'none',
    fontSize: '130%',
    paddingBottom: '5px',
    fontFamily: 'CooperHewitt-Book'
  })

  function buttonStyle (img) {
    return {
      background: 'rgb(43,43,51)',
      '-webkit-mask': `url(${img}) center / contain no-repeat`,
      marginLeft: '5px',
      marginRight: '10px',
      height: 40,
      width: 40,
      cursor: 'pointer'
    }
  }

  css(group.first, buttonStyle('./images/first.svg'))
  css(group.prev, buttonStyle('./images/prev.svg'))
  css(group.next, buttonStyle('./images/next.svg'))
  css(group.last, buttonStyle('./images/last.svg'))

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

  group.first.onclick = function () {
    self.emit('first')
  }

  group.prev.onclick = function () {
    self.emit('prev')
  }

  group.next.onclick = function () {
    self.emit('next')
  }

  group.last.onclick = function () {
    self.emit('last')
  }

  self.showSearch = function () {
    css(img, { display: 'block' })
    css(input, { display: 'block' })
    input.focus()
  }

  self.clear = function () {
    input.value = ''
  }

  self.showButtons = function () {
    ;[group.first, group.prev, group.next, group.last].forEach(function (b) {
      css(b, 'display', 'inline-block')
    })
  }

  self.offPrev = function () {
    css(group.prev, { opacity: 0.4 })
  }

  self.offNext = function () {
    css(group.next, { opacity: 0.4 })
  }

  self.offFirst = function () {
    css(group.first, { opacity: 0.4 })
  }

  self.offLast = function () {
    css(group.last, { opacity: 0.4 })
  }

  self.hideButtons = function () {
    ;[group.first, group.prev, group.next, group.last].forEach(function (b) {
      css(b, 'display', 'none')
    })
  }

  self.onPrev = function () {
    css(group.prev, { opacity: 0.85 })
  }

  self.onNext = function () {
    css(group.next, { opacity: 0.85 })
  }

  self.onFirst = function () {
    css(group.first, { opacity: 0.85 })
  }

  self.onLast = function () {
    css(group.last, { opacity: 0.85 })
  }

  self.updateButtons = function (stats) {
    var first = stats.from === 0
    var mid = !first && stats.to < stats.total
    var last = stats.to >= stats.total
    if (first) {
      css(group.prev, { display: 'none' })
      css(group.next, { display: 'block' })
    } else if (mid) {
      self.showButtons()
    } else if (last) {
      css(group.prev, { display: 'block' })
      css(group.next, { display: 'none' })
    }
  }

  self.hideButtons()
}

module.exports = Search
