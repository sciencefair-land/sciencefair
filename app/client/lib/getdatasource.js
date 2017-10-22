var path = require('path')
var datasourcePath = path.join(__dirname, 'lib', 'datasource')

const Datasource = window.require(datasourcePath)

const datasources = {}

const fetchds = (opts, cb) => {
  let key = typeof opts === 'string' ? opts : opts.key
  const ds = datasources[key] || Datasource(key, opts)
  datasources[key] = ds
  return cb(null, ds)
}

module.exports = {
  fetch: fetchds,
  all: () => Object.keys(datasources).map(key => datasources[key]),
  del: key => fetchds(key, (err, ds) => {
    if (err) throw err
    ds.remove(() => { delete datasources[key] })
  })
}
