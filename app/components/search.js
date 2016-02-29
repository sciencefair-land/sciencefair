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

  css(img, {
    position: 'absolute',
    marginTop: '4%',
    marginLeft: '5%',
    zIndex: 2000
  })
  
  css(input,{
    position: 'absolute',
    marginTop: '4%',
    marginLeft: '5%',
    width: '36%',
    height: '4%',
    border: 'none',
    borderBottom: 'dotted 2px rgb(33,33,39)',
    fontSize: '130%',
    paddingLeft: '35px',
    paddingBottom: '5px',
    fontFamily: 'CooperHewitt-Book',
    background: 'none'
  })

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
}

module.exports = Search