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

module.exports = function (opts, cb) {
  if (!cb) {
    cb = opts
    opts = {}
  }

  const merged = defaults(opts, collectionDefaults)
  yuno(merged, cb)
}
