var portfinder = require('portfinder')
var nstatic = require('node-static')

function ContentServer (datadir) {
  if (!(this instanceof ContentServer)) return new ContentServer(datadir)
  var self = this

  var file = new nstatic.Server(datadir, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })

  portfinder.getPort((err, port) => {
    if (err) throw err

    require('http').createServer(function (request, response) {
      request.addListener('end', function () {
        file.serve(request, response, function (err, result) {
          if (err) { // There was an error serving the file
            console.error('Error serving ' + request.url + ' - ' + err.message)

            // Respond to the client
            response.writeHead(err.status, err.headers)
            response.end()
          }
        })
      }).resume()
    }).listen(port)

    console.log('Content server serving', datadir, 'at', port)
    self.port = port
  })
}

module.exports = ContentServer
