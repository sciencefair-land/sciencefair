var path = require('path')
var searcher  = require('sqlite-search')
var _ = require('lodash')

var header = document.getElementById('header')
var main = document.getElementById('main')
var footer = document.getElementById('footer')

var search = require('./components/search.js')(main)
var list = require('./components/list.js')(main)
var message = require('./components/message.js')(main)
var progress = require('./components/progress.js')(main)
var transfers = require('./components/transfers.js')(footer)
var title = require('./components/title.js')(header)

var opts = {
  path: path.join(__dirname, 'db', 'sample.sqlite'),
  name: 'Papers',
  primaryKey: 'id',
  columns: ['title', 'author']
}

function fetch (input) {
  var results = []
  searcher(opts, function (err, instance) {
    var stream = instance.createSearchStream({field: 'Papers', query: input})
    stream.on('data', function(row) {
      results.push(row)
    })
    stream.on('end', function () {
      if (results.length > 0) list.update(results)
    })
  })  
}

function ready () {
  search.show()
  message.update('Search for a paper.')
  progress.hide()
}

// welcome message
message.update('Initializing...')
search.hide()

// fake initializing
var downloaded = 0
var timer = setInterval(function () {
  if (downloaded >= 100) {
    clearInterval(timer)
    ready()
  }
  progress.update(downloaded)
  downloaded += 10
}, 50)

// update list on search
search.on('input', function (input) {
  if (input === '') {
    message.show() 
    list.update([])
  } else {
    message.hide()
    fetch(input)
  }
})

// download on paper click
list.on('click', function (paper) {
  transfers.update(50)
  setTimeout(function () {
    transfers.update(0)
    paper.downloaded()
  }, 500)
})