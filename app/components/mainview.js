var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter

inherits(MainView, EventEmitter)

function MainView(opts) {
  if (!(this instanceof MainView)) return new MainView(opts)

  var self = this
  self.metadataDB = null

  // components
  var search = require('./search.js')(
    opts.containers.main
  )
  var displayController = require('./resultscontroller.js')(
    opts.containers.main,
    opts
  )
  var statbar = require('./statbar.js')(
    opts.containers.footer
  )

  var searchCursor = {}

  var doSearch = _.debounce(function(query) {
    searchCursor = self.metadataDB.search(query, { pageSize: 50 }, updateList)
  }, 200)

  function updateList (err, results) {
    if (err) throw err
    opts.message.update('')
    opts.message.hide()

    if (results.totalHits > searchCursor.pageSize) {
      search.showButtons()
    } else {
      search.hideButtons()
    }

    if (results.offset >= searchCursor.pageSize) {
      search.onFirst()
      search.onPrev()
    } else {
      search.offFirst()
      search.offPrev()
    }

    var penultimatePage = Math.floor(results.totalHits/ searchCursor.pageSize)
    var lastPageStart = penultimatePage * searchCursor.pageSize
    var lastPage = results.offset >= lastPageStart
    if (results.totalHits > results.offset && !lastPage) {
      search.onNext()
      search.onLast()
    } else {
      search.offNext()
      search.offLast()
    }

    statbar.setTotalResults(results.totalHits)
    var from = results.offset + 1
    var to = results.offset + results.hits.length
    statbar.updateResultStats({ from: from, to: to })

    displayController.clear()
    displayController.update(results.hits.map((hit) => paper(hit, opts)))
  }

  search.on('input', function (input) {
    displayController.clear()
    if (input === '') {
      statbar.updateResultStats()
      search.hideButtons()
      opts.message.update('Search for a paper.')
      opts.message.show()
    } else {
      opts.message.update('Searching...')
      opts.message.show()
      doSearch(input)
    }
  })

  search.on('first', function () {
    searchCursor.first(updateList)
  })

  key('shift+left', function() {
    searchCursor.first(updateList)
  })

  search.on('last', function () {
    searchCursor.last(updateList)
  })

  key('shift+right', function() {
    searchCursor.last(updateList)
  })

  search.on('prev', function () {
    searchCursor.prev(updateList)
  })

  key('left', function() {
    searchCursor.prev(updateList)
  })

  search.on('next', function () {
    searchCursor.next(updateList)
  })

  key('right', function() {
    searchCursor.next(updateList)
  })

  // download on paper click
  displayController.on('paper.click', function (item) {
    console.log('paper.click', item)
    if (item.paper.downloaded || item.paper.downloadStarted) {
      return
    }
    statbar.updateSpeed(50)
    fulltext.downloadPaperHTTP(item.paper)
  })

  self.metadataReady = function(metadataDB) {
    self.metadataDB = metadataDB
    statbar.setdb(metadataDB)
    search.showSearch()
    opts.message.update('Search for a paper.')
    opts.message.show()
  }

}

module.exports = MainView
