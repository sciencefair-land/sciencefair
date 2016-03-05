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

var databases = {
  eupmc: {
    path: 'sqlite/eupmc.sqlite',
    name: 'EuropePMC free full-text (3.5m)',
    description: 'Simple metadata for ~3.5 million free full-text articles in Europe PubMed Central',
    shortname: 'eupmc',
    datHash: 'b57f332de2444ac963bb764f3b4e0b8cf01a42044501e688d0a5f1a2f701ca71'
  },
  sample: {
    path: 'sample.sqlite',
    name: 'Sample database',
    description: 'A fake database used for UI demoing',
    shortname: 'sample'
  }
}
var dbs = ['eupmc', 'sample']

function dbFileExists (dbfile) {
  return fs.existsSync(path.join(__dirname, 'db', dbfile))
}

function getdb () {
  var i = 0
  var dbkey = dbs[i]
  var db = databases[dbkey]
  while(!dbFileExists(db.path) && i < dbs.length) {
    i += 1
    dbkey = dbs[i]
    db = databases[dbkey]
  }
  statbar.setdb(db)
  return db.path
}

var opts = {
  path: path.join(__dirname, 'db', getdb()),
  name: 'Papers',
  primaryKey: 'id',
  columns: ['title', 'authorString', 'doi', 'year'],
  limit: 30
}

var countParts = ["(select count() from ", ") as count"]

function makeQuery (input) {
  var countSelector = countparts[0] + opts.name + countparts[1]
  select = [countSelector, ['*']]
  var statement =
    "SELECT " + select.join(', ') +
    " FROM " + opts.name +
    " WHERE " +
    (since ? opts.primaryKey + " > '" + since + "' AND " + field : field) +
    " MATCH '" + query + "'" +
    " ORDER BY " + order +
    (opts.limit ? " LIMIT " + opts.limit : '') +
    (offset ? " OFFSET " + offset : '') +
    ";"
}

// track the most recent search input so we don't
// mix results from previous partial search entries
var currentSearch = '';

function fetch (input) {
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
      console.log(input, currentSearch)
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
        list.update(results)
      }
    })
  })
}

// update list on search
search.on('input', function (input) {
  currentSearch = input
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
  statbar.updateSpeed(50)
  setTimeout(function () {
    statbar.updateSpeed(0)
    paper.downloaded()
  }, 500)
})
