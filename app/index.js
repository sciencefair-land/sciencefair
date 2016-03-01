var path = require('path')
var fs = require('fs')
var searcher  = require('sqlite-search')
var _ = require('lodash')

var header = document.getElementById('header')
var main = document.getElementById('main')
var footer = document.getElementById('footer')

var search = require('./components/search.js')(main)
var list = require('./components/list.js')(main)
var message = require('./components/message.js')(main)
var statbar = require('./components/statbar.js')(footer)
var title = require('./components/title.js')(header)

var dbfiles = ['sqlite/eupmc.sqlite', 'sample.sqlite']

function dbFileExists (dbfile) {
  return fs.existsSync(path.join(__dirname, 'db', dbfile))
}

function getdb () {
  var i = 0
  var dbfile = dbfiles[i]
  while(!dbFileExists(dbfile) && i < dbfiles.length) {
    i += 1
    dbfile = dbfiles[i]
  }
  console.log('using database at', dbfile)
  return dbfile
}

var opts = {
  path: path.join(__dirname, 'db', getdb()),
  name: 'Papers',
  primaryKey: 'id',
  columns: ['title', 'authorString', 'doi', 'year'],
  limit: 30
}

function fetch (input) {
  console.log(input)
  var results = []
  var first = true
  searcher(opts, function (err, instance) {
    if (err) {
      message.update('Oops, there was an error')
      message.show()
      console.log(err)
    }
    list.clear()
    var stream = instance.createSearchStream({
      field: 'Papers',
      query: input,
      limit: opts.limit
    })
    stream.on('data', function(row) {
      if (first) {
        message.hide()
        first = false
      }
      results.push(row)
      if (results.length == 10) {
        list.update(results)
        results = []
      }
    })
    stream.on('end', function () {
      list.update(results)
    })
  })
}

// update list on search with fake data (for now!)
search.on('input', function (input) {
  if (input === '') {
    message.update('Search for a paper.')
    message.show()
    list.update([])
  } else {
    message.update('Searching...')
    message.show()
    fetch(input)
  }
})

// fake a download on paper click
list.on('click', function (paper) {
  statbar.update(50)
  setTimeout(function () {
    statbar.update(0)
    paper.downloaded()
  }, 500)
})
