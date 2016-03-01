var css = require('dom-css')

function Progress (container) {
  if (!(this instanceof Progress)) return new Progress(container)
  var self = this

  var progress = container.appendChild(document.createElement('div'))
  var fill = progress.appendChild(document.createElement('div'))
  
  css(progress, {
    position: 'absolute',
    width: '45%',
    height: '7%',
    marginLeft: '5%',
    marginTop: '30%',
    backgroundColor: 'rgb(60,94,105)',
    pointerEvents: 'none'
  })

  css(fill, {
    width: '0%',
    height: '100%',
    backgroundColor: 'rgb(82,129,143)',
    transition: 'width 0.1s'
  })

  self.update = function (value) {
    css(fill, {
      width: value + '%'
    })
  }

  self.hide = function () {
    css(progress, {opacity: 0})
  }

  self.show = function () {
    css(progress, {opacity: 1})
  }
}

module.exports = Progress