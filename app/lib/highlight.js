var find = require('findandreplacedomtext')
var css = require('dom-css')

// Highlights all the words in text inside a node
function Highlight(node, text, wrapper) {
  if (!Array.isArray(text)) {
    text = text.split(' ')
  }

  if (!wrapper) {
    wrapper = document.createElement('span')
    css(wrapper, {
      background: 'yellow',
      color: 'black'
    })
  }

  text.forEach(function(word) {
    find(node, { find: RegExp(word,"gi"), wrap: wrapper })
  })
}

module.exports = Highlight
