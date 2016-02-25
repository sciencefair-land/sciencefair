var css = require('dom-css')

function Title (container) {
  if (!(this instanceof Title)) return new Title(container)

  var title = container.appendChild(document.createElement('div'))

  var science = title.appendChild(document.createElement('span'))
  science.innerHTML = 'science'
  var fair = title.appendChild(document.createElement('span'))
  fair.innerHTML = 'fair'
  
  css(title,{
    position: 'absolute',
    top: '2px',
    right: '1%',
    width: '30%',
    fontFamily: 'Aleo-Light',
    textAlign: 'right',
    fontSize: '130%',
    opacity: 0.7
  })

  css(science, {
    color: 'rgb(111,174,193)'
  })

  css(fair, {
    color: 'rgb(202,172,77)'
  })

}

module.exports = Title