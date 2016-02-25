var _ = require('lodash')

var header = document.getElementById('header')
var main = document.getElementById('main')
var footer = document.getElementById('footer')

var search = require('./components/search.js')(main)
var list = require('./components/list.js')(main)
var message = require('./components/message.js')(main)
var transfers = require('./components/transfers.js')(footer)
var title = require('./components/title.js')(header)

// generate fake data
function items (count) {
  return _.range(count).map(function () {
    return {
      title: 'Cytodiagnostic accuracy and pitfalls', 
      author: 'Gia-Khanh Nguyen; Jody Ginsberg; Peter M. Crockford;'
    }
  })
}

// welcome message
message.update('Search for a paper.')

// update list on search with fake data (for now!)
search.on('input', function (input) {
  if (input === '') {
    message.show() 
    list.update([])
  } else {
    message.hide()
    list.update(items(parseInt(Math.random() * 30)))
  }
})

// fake a download on paper click
list.on('click', function (paper) {
  transfers.update(50)
  setTimeout(function () {
    transfers.update(0)
    paper.downloaded()
  }, 500)
})