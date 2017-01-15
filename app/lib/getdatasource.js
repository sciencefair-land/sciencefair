const Datasource = require('./datasource')

const datasources = {}

module.exports = {
  fetch: (opts, cb) => {
    let key = typeof opts === 'string' ? opts : opts.key
    const ds = datasources[key] || Datasource(key, opts)
    datasources[key] = ds
    return cb(null, ds)
  },
  all: () => Object.keys(datasources).map(key => datasources[key]),
  del: key => datasources[key].remove(() => { delete datasources[key] })
}
