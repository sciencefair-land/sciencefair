// this subscription loads the default datasets and then ends
// for now just elife

const path = require('path')
const C = require('./constants.js')
const exists = require('path-exists').sync

module.exports = (send, done) => {
  const key = '4a7c5ceeaaf539474139e254dcfa6b73aeb4951c963dc5d1bfd0df11670cd81c'

  const elifein = path.join(__dirname, '..', 'static', 'elife-meta.tar.gz')
  const elifeout = path.join(C.DATASOURCES_PATH, key)

  if (exists(elifeout)) return done()

  const fs = require('fs-extra')
  const targz = require('tar.gz')

  fs.mkdirsSync(elifeout)

  targz().extract(elifein, elifeout, err => {
    if (err) console.error('Failed to extract default data source ', err)
  })

  send('datasource_add', { key: key }, done)
}
