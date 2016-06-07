var portfinder = require('portfinder')
var nstatic = require('node-static')

function ContentServer (datadir) {
  if (!(this instanceof ContentServer)) return new ContentServer(datadir)
  var self = this

  var file = new nstatic.Server(datadir)

  portfinder.getPort(function (err, port) {
    if (err) throw err

    require('http').createServer(function (request, response) {
      request.addListener('end', function () {
        file.serve(request, response)
      }).resume()
    }).listen(port)

    console.log('Content server serving', datadir, 'at', port)
    self.port = port
  })
}

module.exports = ContentServer
