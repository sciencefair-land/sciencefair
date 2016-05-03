var path = require('path')
var fs = require('fs')
var _ = require('lodash')
var mkdirp = require('mkdirp')
var untildify = require('untildify')
var paper = require('./lib/paper.js')

var key = require('keymaster')

var testing = process.env['SCIENCEFAIR_DEVMODE'] === "TRUE"
console.log("Testing mode", testing ? "ON" : "OFF")
if (testing) require('debug-menu').install()

// layout
var header = document.getElementById('header')
var main = document.getElementById('main')
var footer = document.getElementById('footer')
var title = require('./components/title.js')(header)

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
var fulltext = pubdata.getFulltextSource(testing)[0]

var view = require('./components/mainview.js')({
  containers: {
    header: header,
    main: main,
    footer: footer
  },
  pubdata: pubdata,
  fulltextSource: fulltext,
  metadataSource: metadata,
  datadir: datadir,
  contentServer: contentServer,
  testing: testing,
  message: message
})

// start
metadata.ensure(function() {
  var metadataDB = require('./lib/database.js')(metadata)
  metadataDB.on('ready', function() {
    view.metadataReady(metadataDB)
  })
})
