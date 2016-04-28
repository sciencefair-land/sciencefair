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

  var first = buttons.appendChild(document.createElement('img'))
  first.className = 'search-btn clickable'
  var prev = buttons.appendChild(document.createElement('img'))
  prev.className = 'search-btn clickable'
  var next = buttons.appendChild(document.createElement('img'))
  next.className = 'search-btn clickable'
  var last = buttons.appendChild(document.createElement('img'))
  last.className = 'search-btn clickable'

  css(img, {
    position: 'absolute',
    marginTop: 'calc(4% + 2px)',
    marginLeft: 'calc(5% + 2px)',
    zIndex: 900,
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

  function buttonStyle(btn, img) {
    return {
      background: 'rgb(43,43,51)',
      '-webkit-mask': `url(${img}) center / contain no-repeat`,
      marginLeft: '10px',
      height: 40,
      width: 40
    }
  }

  css(first, buttonStyle(first, './images/first.svg'))
  css(prev, buttonStyle(prev, './images/prev.svg'))
  css(next, buttonStyle(next, './images/next.svg'))
  css(last, buttonStyle(last, './images/last.svg'))

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

  first.onclick = function () {
    self.emit('first')
  }

  prev.onclick = function () {
    self.emit('prev')
  }

  next.onclick = function () {
    self.emit('next')
  }

  last.onclick = function () {
    self.emit('last')
  }

  self.showSearch = function () {
    css(img, { display: 'block' })
    css(input, { display: 'block' })
    input.focus()
  }

  self.showButtons = function () {
    ;[first, prev, next, last].forEach(function(b) {
      css(b, 'display', 'inline-block')
    })
  }

  self.offPrev = function () {
    css(prev, { opacity: 0.6 })
  }

  self.offNext = function () {
    css(next, { opacity: 0.6 })

  }

  self.offFirst = function () {
    css(first, { opacity: 0.6 })

  }

  self.offLast = function () {
    css(last, { opacity: 0.6 })

  }

  self.hideButtons = function () {
    ;[first, prev, next, last].forEach(function(b) {
      css(b, 'display', 'none')
    })
  }

  self.onPrev = function () {
    css(prev, { opacity: 0.85 })
  }

  self.onNext = function () {
    css(next, { opacity: 0.85 })
  }

  self.onFirst = function () {
    css(first, { opacity: 0.85 })
  }

  self.onLast = function () {
    css(last, { opacity: 0.85 })
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
