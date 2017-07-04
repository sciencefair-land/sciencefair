var find = require('findandreplacedomtext')

// Highlights all the words in text inside a node
function Highlight (node, text, wrapper) {
  if (!node) throw new Error('highlight called without a node')
  if (!text) return

  if (!Array.isArray(text)) {
    text = text.replace('*', '').trim()
    if (!text) return
    text = text.split(' ')
  }

  if (!wrapper) {
    wrapper = document.createElement('span')
    wrapper.style.cssText = 'color: rgb(202, 172, 77);'
  }

  text.forEach(function (word) {
    if (word.length > 0) {
      find(node, { find: RegExp(word, 'gi'), wrap: wrapper })
    }
  })
}

module.exports = Highlight
