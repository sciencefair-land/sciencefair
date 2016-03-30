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

var getdata = require('./lib/data.js')

var dbs = []
var corpora = []

var testing = true

message.update('Loading data sources...')
message.show()

getdata(testing, function(err, datasource) {
  if (err) {
    console.log(err)
  }
  if (datasource.type === 'fulltext') {
    corpora.push(datasource)
  } else if (datasource.type === 'metadata') {
    dbs.push(datasource)
    statbar.setdb(datasource)
    activateSearch()
  }
})

function activateSearch() {
  search.showSearch()
  message.update('Search for a paper.')
  message.show()
}

function getSearchOpts() {
  var db = dbs[0]

  return {
    path: path.join(path.resolve('data'), db.dir, db.filename),
    name: 'Papers',
    primaryKey: 'id',
    columns: ['title', 'authorString', 'doi', 'year'],
    limit: 30
  }
}

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

function runQuery(instance, input, field) {
  var results = []
  var total = 0
  var first = true
  var opts = getSearchOpts()
  var conf = {
    field: field,
    query: input,
    limit: opts.limit,
    offset: offset
  }
  var stream = instance.createSearchStream(conf)
  stream.on('data', function(row) {
    total += 1
    if (input === currentSearch) {
      if (first) {
        message.hide()
        first = false
      }
      results.push(row)
      if (results.length == 10) {
        list.update(results)
        results = []
      }
    }
  })
  stream.on('end', function () {
    if (input === currentSearch) {
      if (first && results.length == 0) {
        message.update('No results found.')
      } else {
        statbar.updateResultStats({
          from: offset,
          to: offset + total
        })
        search.updateButtons({
          from: offset,
          to: offset + total,
          total: statbar.totalResults
        })
        list.update(results)
      }
    }
  })
}

// track the most recent search input so we don't
// mix results from previous partial search entries
var currentSearch = ''
var offset = 0

function fetch (input) {
  var opts = getSearchOpts()
  searcher(opts, function (err, instance) {
    if (err) {
      message.update('Oops, there was an error!')
      message.show()
      console.log(err)
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
  offset = 0
  currentSearch = input
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
  console.log('prev clicked')
  offset = Math.max(offset -30, 0)
  fetch(currentSearch)
})

search.on('next', function () {
  console.log('next clicked')
  offset += 30
  fetch(currentSearch)
})

// fake a download on paper click
list.on('click', function (paper) {
  statbar.updateSpeed(50)
  setTimeout(function () {
    statbar.updateSpeed(0)
    paper.downloaded()
  }, 100)
})
