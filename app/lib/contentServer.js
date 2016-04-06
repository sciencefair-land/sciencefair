var portfinder = require('portfinder')
var static = require('node-static')

function ContentServer(datadir) {
  if (!(this instanceof ContentServer)) return new ContentServer(datadir)
  var self = this

  var file = new static.Server(datadir);

  portfinder.getPort(function (err, port) {

    if (err) cb(err)

    require('http').createServer(function (request, response) {

      request.addListener('end', function () {
          console.log(request)
          file.serve(request, response)
      }).resume()

    }).listen(port)

    console.log('Content server serving', datadir, 'at', port)
    self.port = port

  })

}

module.exports = ContentServer
