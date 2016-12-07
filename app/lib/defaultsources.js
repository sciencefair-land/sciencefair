// this subscription loads the default datasets and then ends
// for now just elife

const path = require('path')
const C = require('./constants.js')
const exists = require('path-exists').sync

module.exports = (send, done) => {
  const key = '5af621077fe8f9c93ca08da679eedff26dd08c81f8456c73c17847eabb8b3774'

  const elifein = path.join(__dirname, '..', 'static', 'elife_seed.tar.gz')
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
