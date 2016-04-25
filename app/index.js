var path = require('path')
var fs = require('fs')
var _ = require('lodash')
var mkdirp = require('mkdirp')
var untildify = require('untildify')

var testing = process.env['SCIENCEFAIR_DEVMODE'] === "TRUE"
console.log("Testing mode", testing ? "ON" : "OFF")

// layout
var header = document.getElementById('header')
var main = document.getElementById('main')
var footer = document.getElementById('footer')

// setup data sources and server
var message = require('./components/message.js')(main)
message.update('Loading data sources...')
message.show()

var datadir = untildify('~/.sciencefair/data')
mkdirp.sync(datadir)
console.log('data directory:', datadir)

var contentServer = require('./lib/contentServer.js')(datadir)
var pubdata = require('./lib/pubdata.js')(datadir, testing)

var metadata = pubdata.getMetadataSource(testing)[0]
var metadataDB = null
var fulltext = pubdata.getFulltextSource(testing)[0]

// components
var search = require('./components/search.js')(main)
var list = require('./components/list.js')(main, {
  fulltextSource: fulltext,
  datadir: datadir,
  contentServer: contentServer
})
var statbar = require('./components/statbar.js')(footer)
var title = require('./components/title.js')(header)

// start
metadata.ensure(function() {
  metadataDB = require('./lib/database.js')(metadata)
  metadataDB.on('ready', function() {
    statbar.setdb(metadataDB)
    search.showSearch()
    message.update('Search for a paper.')
    message.show()
  })
})

var searchCursor = {}

var doSearch = _.debounce(function(query) {
  searchCursor = metadataDB.search(query, { pageSize: 30 }, updateList)
}, 200)

function updateList (err, results) {
  if (err) throw err
  message.update('')
  message.hide()

  if (results.offset >= searchCursor.pageSize) {
    search.showPrev()
  } else {
    search.hidePrev()
  }

  var penultimatePage = Math.floor(results.totalHits/ searchCursor.pageSize)
  var lastPageStart = penultimatePage * searchCursor.pageSize
  var lastPage = results.offset >= lastPageStart
  if (results.totalHits > results.offset && !lastPage) {
    search.showNext()
  } else {
    search.hideNext()
  }

  list.clear()
  list.update(results.hits)
}

// update list on search
search.on('input', function (input) {
  list.clear()
  if (input === '') {
    statbar.updateResultStats()
    search.hideButtons()
    message.update('Search for a paper.')
    message.show()
  } else {
    message.update('Searching...')
    message.show()
    doSearch(input)
  }
})

search.on('prev', function () {
  searchCursor.prev(updateList)
})

search.on('next', function () {
  searchCursor.next(updateList)
})

// fake a download on paper click
list.on('click', function (paper) {
  if (paper.file) {
    return
  }
  statbar.updateSpeed(50)
  fulltext.downloadPaperHTTP(paper)
})
