const http = require('http')
const portfinder = require('portfinder')
const nstatic = require('node-static')
const C = require('../../constants')
const datadir = C.DATASOURCES_PATH

function ContentServer () {
  const self = this

  const file = new nstatic.Server(datadir, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })

  portfinder.getPort((err, port) => {
    if (err) throw err

    http.createServer((request, response) => {
      request.addListener('end', () => {
        file.serve(request, response, (err, result) => {
          if (err) { // There was an error serving the file
            console.error('Error serving ' + request.url + ' - ' + err.message)

            response.writeHead(err.status, err.headers)
            response.end()
          }
        })
      }).resume()
    }).listen(port)

    console.log('Content server serving', datadir, 'at', port)
    self.port = port
  })

  self.resolve = path => `http://localhost:${self.port}/${path}`
}

const server = new ContentServer()

module.exports = server
