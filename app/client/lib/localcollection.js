const yuno = window.require('yunodb')
const defaults = require('lodash/defaults')

const C = require('../../constants')

const collectionDefaults = {
  deletable: true,
  location: C.COLLECTION_PATH,
  nGramLength: [1, 2, 3],
  keyField: '$.key',
  indexMap: {
    'title': true,
    'author': false,
    'authorstr': true,
    'date': false,
    'identifier': false,
    'abstract': true,
    'tags': true
  }
}

let localcollection

module.exports = (opts, cb) => {
  if (!cb) {
    cb = opts
    opts = {}
  }

  if (localcollection) return cb(null, localcollection)

  const merged = defaults(opts, collectionDefaults)

  let tries = 0
  const dotry = () => yuno(merged, (err, db) => {
    if (err) {
      tries++
      tries > 5 ? cb(err) : setTimeout(dotry, 500)
    } else {
      localcollection = db
      cb(null, db)
    }
  })

  dotry()
}
