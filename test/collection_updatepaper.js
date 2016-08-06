const path = require('path')

const test = require('tape')
const tmp = require('temporary')
const rimraf = require('rimraf')

const catpapers = require('../mocks/cats.json')

const tmpdir = new tmp.Dir()
const dbpath = path.join(tmpdir.path, 'yuno')

const effect = require('../app/effects/collection_updatepaper')

test('effect: collection_updatepaper', (t) => {
  require('../mocks/populated_collection')({
    location: dbpath
  }, run)

  function done () {
    rimraf(dbpath, {}, t.end)
  }

  function run (err, local) {
    if (err) throw err

    const state = {
      collection: {
        index: local
      }
    }

    const data = {
      id: catpapers[0].identifier[0].id,
      document: catpapers[0]
    }

    data.document.tags = ['changed']

    effect(data, state, null, (err) => {
      t.error(err, 'update paper')

      if (err) {
        done()
      } else {
        local.get(data.id, (err, paper) => {
          if (err) throw err

          const newtags = JSON.parse(paper).tags
          t.deepEqual(newtags, ['changed'], 'update is reflected in db')
          done()
        })
      }
    })
  }
})
