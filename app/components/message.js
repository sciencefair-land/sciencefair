var css = require('dom-css')

function Message (container) {
  if (!(this instanceof Message)) return new Message(container)
  var self = this

  var message = container.appendChild(document.createElement('div'))

  css(message, {
    position: 'absolute',
    marginLeft: '5%',
    marginTop: '40%',
    fontFamily: 'Aleo-Light',
    textAlign: 'left',
    fontSize: '500%',
    color: 'rgb(43,43,51)',
    pointerEvents: 'none'
  })

  self.update = function (value) {
    message.innerHTML = value
  }

  self.hide = function () {
    css(message, {opacity: 0})
  }

  self.show = function () {
    css(message, {opacity: 1})
  }
}

module.exports = Message
