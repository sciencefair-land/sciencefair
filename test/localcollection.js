const path = require('path')

const test = require('tape')
const tmp = require('temporary')
const rimraf = require('rimraf')

const catpapers = require('../dev/cats.json')

const tmpdir = new tmp.Dir()
const dbpath = path.join(tmpdir.path, 'yuno')

test('localcollection', (t) => {
  require('../lib/localcollection')({
    location: dbpath
  }, run)

  function run (err, local) {
    t.error(err, `opening local collection at ${dbpath}`)

    if (err) {
      done()
    } else {
      testadd()
    }

    function done () {
      rimraf(dbpath, {}, t.end)
    }

    function testadd () {
      local.add(catpapers, (err) => {
        t.error(err, 'add papers')

        if (err) {
          done()
        } else {
          testsearch()
        }
      })
    }

    function testsearch () {
      local.search('cats', (err, results) => {
        t.error(err, 'search papers')

        if (err) {
          done()
        } else {
          t.equals(results.hits.length, 3, 'correct number of hits')

          testdel()
        }
      })
    }

    function testdel () {
      local.del(catpapers[0].identifier[0].id, (err) => {
        t.error(err, 'remove papers')

        if (err) {
          done()
        } else {
          local.get(catpapers[0].identifier[0].id, (err, paper) => {
            t.ok(err, 'removed paper no longer exists in collection')

            done()
          })
        }
      })
    }
  }
})
