// this subscription loads the default datasets and then ends
// for now just elife

const path = require('path')
const C = require('./constants.js')
const exists = require('path-exists').sync

module.exports = (send, done) => {
  const key = 'b85786881a4adc7e919899bb47fe41bc56d098c602be1adcaad5fe6a350868e4'

  const elifein = path.join(__dirname, '..', 'static', 'elife_small_seed.tar.gz')
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
