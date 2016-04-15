var path = require('path')
var fs = require('fs')
var searcher  = require('sqlite-search')
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
console.log(datadir)

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
    statbar.setdb(db)
    search.showSearch()
    message.update('Search for a paper.')
    message.show()
  })
})

function countResults(instance, input, field) {
  var opts = getSearchOpts()
  var cnt = `SELECT count() FROM ${opts.name} WHERE ${field} MATCH '${input}';`
  var stream = instance.createSearchStream({
    field: 'Papers',
    statement: cnt,
    limit: opts.limit,
    offset: offset
  })
  stream.on('data', function(row) {
    statbar.setTotalResults(row['count()'])
  })
}

function fetch (input) {
  var newquery = metadataDB.search(input, null, metadataDB)

  lastquery = newquery

  var resultEmitter = newquery.nextPage()

  resultEmitter.on('err', function(err) {
    message.update('Oops, there was an error!')
    message.show()
    console.log(err)
  })

  resultEmitter.on('results', function(res) {
    console.log(res)
  })

  searcher(opts, function (err, instance) {
    if (err) {

    }
    list.clear()

    // count the total hits in a separate query
    // running a joint query is *much* slower
    if (offset == 0) {
      countResults(instance, input, 'Papers')
    }
    runQuery(instance, input, 'Papers')
  })
}

// update list on search
search.on('input', function (input) {
  if (input === '') {
    list.clear()
    statbar.updateResultStats()
    search.hideButtons()
    message.update('Search for a paper.')
    message.show()
  } else {
    message.update('Searching...')
    message.show()
    fetch(input)
  }
})

search.on('prev', function () {
  offset = Math.max(offset -30, 0)
  fetch(currentSearch)
})

search.on('next', function () {
  offset += 30
  fetch(currentSearch)
})

// fake a download on paper click
list.on('click', function (paper) {
  if (paper.file) {
    return
  }
  statbar.updateSpeed(50)
  fulltext.downloadPaperHTTP(paper, (err, files) => {
    if (err) {
      paper.downloadFailed(err)
      return console.log(err)
    }
    files.forEach((file) => {
      paper.downloaded(file)
    })
    statbar.updateSpeed(0)
  })
})
