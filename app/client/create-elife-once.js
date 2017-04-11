var yuno = require('yunodb')
var untildify = require('untildify')
var fs = require('fs')
var glob = require('matched')
var path = require('path')
var after = require('lodash/after')

module.exports = cb => {
  var dir = untildify('~/.sciencefair/elife/meta')

  const dbopts = {
    location: untildify('~/.sciencefair/elife/db'),
    keyField: '$.identifier[0].id',
    indexMap: {
      'title': true,
      'author': true,
      'date': false,
      'identifier': false,
      'abstract': true
    }
  }

  var thisdb
  var entries = glob.sync(
    ['*.json'], { cwd: dir }
  ).slice(
    0, 10
  ).map(
    file => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'))
  )

  console.log(entries)

  const done = after(entries.length, () => {
    thisdb.close(cb)
  })

  yuno(dbopts, (err, db) => {
    if (err) throw err
    thisdb = db

    db.add(entries, (err) => {
      if (err) throw err
      done()
    })
  })
}
