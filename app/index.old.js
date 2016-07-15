var mkdirp = require('mkdirp')
var untildify = require('untildify')

var testing = process.env['SCIENCEFAIR_DEVMODE'] === 'TRUE'
testing = true // TODO: turn this off when we cut first release
console.log('Testing mode', testing ? 'ON' : 'OFF')
if (testing) {
  require('debug-menu').install()
}

// layout
var header = document.getElementById('header')
var title = require('./components/title.js')(header)
var mid = document.getElementById('middle')
var main = require('./components/main.js')(mid)
var footer = document.getElementById('footer')

// setup data sources and server
var message = require('./components/message.js')(main.element)
message.update('Loading data sources...')
message.show()

var datadir = untildify('~/.sciencefair/data')
mkdirp.sync(datadir)
console.log('data directory:', datadir)

var contentServer = require('./lib/contentServer.js')(datadir)
var pubdata = require('./lib/pubdata.js')(datadir, testing)

// var metadata = pubdata.getMetadataSource(testing)[0]
// var fulltext = pubdata.getFulltextSource(testing)[0]
var elife = require('./lib/hyperdrive.js')

var view = require('./components/mainview.js')({
  containers: {
    header: header,
    middle: mid,
    footer: footer,
    title: title,
    main: main
  },
  pubdata: pubdata,
  fulltextSource: elife,
  metadataSource: elife,
  datadir: datadir,
  contentServer: contentServer,
  testing: testing,
  message: message
})

// start
// metadata.ensure(function () {
//   var metadataDB = require('./lib/database.js')(metadata)
//   metadataDB.on('ready', function () {
//     view.metadataReady(metadataDB)
//   })
// })

elife.connect(function (err, db) {
  if (err) throw err
  view.metadataReady(db)
})
