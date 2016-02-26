var css = require('dom-css')
var inherits = require('inherits')
var _ = require('lodash')
var EventEmitter = require('events').EventEmitter

inherits(Paper, EventEmitter)

function Paper (container) {
  if (!(this instanceof Paper)) return new Paper(container)
  var self = this

  var box = container.appendChild(document.createElement('div'))
  box.className = 'paper'
  var title = box.appendChild(document.createElement('div'))
  var author = box.appendChild(document.createElement('div'))

  var base = {
    width: '80%',
    position: 'absolute',
    fontFamily: 'Aleo-Regular',
    textAlign: 'left',
    color: 'rgb(178,180,184)'
  }

  css(box, {
    position: 'relative',
    background: 'rgb(43,43,51)',
    display: 'inline-block',
    marginRight: '2%',
    marginBottom: '2%',
    cursor: 'pointer'
  })

  self.scale = function (value) {

    css(box, {
      width: value + '%'
    })

    var width = box.clientWidth

    css(box, {
      height: width * 1.31,
      padding: width * 0.09
    })

    css(title, _.extend(base, {
      fontSize: width * 0.12  + 'px'
    }))

    css(author, _.extend(base, {
      marginTop: '45%',
      fontSize: width * 0.08  + 'px'
    }))

  }

  self.update = function (value) {
    title.innerHTML = value.title
    author.innerHTML = value.author
  }

  self.downloaded = function () {
    css(box, {
      borderBottom: 'solid 7px rgb(202, 172, 77)'
    })
  }

  self.scale(11.6)

  box.onclick  = function () {
    self.emit('click')
  }
}

module.exports = Paper