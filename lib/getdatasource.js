const Datasource = require('./datasource')

const datasources = {}

module.exports = {
  fetch: (key, cb) => {
    const ds = datasources[key] || Datasource(key)
    datasources[key] = ds
    return cb(null, ds)
  },
  all: () => Object.keys(datasources).map(key => datasources[key]),
  del: key => datasources[key].remove(() => { delete datasources[key] })
}
