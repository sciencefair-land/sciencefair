const yuno = require('yunodb')
const defaults = require('lodash/defaults')

const C = require('./constants')

const collectionDefaults = {
  deletable: true,
  location: C.COLLECTION_PATH,
  nGramLength: [1, 2, 3],
  keyField: '$.key',
  indexMap: {
    'title': true,
    'author': true,
    'date': false,
    'identifier': false,
    'abstract': true,
    'tags': true
  }
}

let loading
let localcollection

module.exports = function (opts, cb) {
  loading = true
  if (!cb) {
    cb = opts
    opts = {}
  }

  if (localcollection) return cb(null, localcollection)
  const maybeUseCache = () => {
    if (loading) setTimeout(maybeUseCache, 100)
    else return cb(null, localcollection)
  }
  maybeUseCache()

  const merged = defaults(opts, collectionDefaults)

  yuno(merged, (err, db) => {
    loading = false
    if (err) return cb(err)
    localcollection = db
    cb(null, db)
  })
}
