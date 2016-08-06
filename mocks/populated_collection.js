const catpapers = require('./cats.json')

module.exports = (opts, cb) => {
  require('../lib/localcollection')(opts, (err, local) => {
    if (err) return cb(err)

    local.add(catpapers, {}, (err) => {
      if (err) return cb(err)

      cb(null, local)
    })
  })
}
