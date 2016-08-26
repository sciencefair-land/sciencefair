const untildify = require('untildify')
const fs = require('fs')
const glob = require('matched')
const path = require('path')

const dir = untildify('~/.sciencefair/elife/meta')

const entries = glob.sync(
  ['*.json'], { cwd: dir }
).map(
  file => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'))
).map(
  entry => {
    entry.datasource = 'elife'
    return entry
  }
)

console.log(entries)

module.exports = (opts, cb) => {
  require('../lib/localcollection')(opts, (err, local) => {
    if (err) return cb(err)

    local.add(entries, {}, (err) => {
      if (err) return cb(err)

      cb(null, local)
    })
  })
}
