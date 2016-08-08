const path = require('path')

const test = require('tape')
const tmp = require('temporary')
const rimraf = require('rimraf')
const after = require('lodash/after')

const tmpdir = new tmp.Dir()
const dbpath = path.join(tmpdir.path, 'yuno')

const effect = require('../app/effects/search_collection')

test('effect: search_collection', (t) => {
  require('../mocks/populated_collection')({
    location: dbpath
  }, run)

  const done = after(4, () => {
    rimraf(dbpath, {}, t.end)
  })

  function run (err, local) {
    if (err) throw err

    const state = { collection: local }

    tagfilter()
    plainsearch()
    searchandfilter()
    emptysearch()

    function tagfilter () {
      const data = {
        tags: ['kittiluminati']
      }

      const sent = {}

      function send (msg, payload, cb) {
        sent[msg] = payload
        cb()
      }

      effect(data, state, send, (err) => {
        t.error(err, 'run tag filter')

        if (err) {
          done()
        } else {
          t.equals(sent['results_receive'].hits.length, 1, 'correct number of hits for tag filter')
          done()
        }
      })
    }

    function plainsearch () {
      const data = {
        query: 'kitteh',
        tags: []
      }

      const sent = {}

      function send (msg, payload, cb) {
        sent[msg] = payload
        cb()
      }

      effect(data, state, send, (err) => {
        t.error(err, 'run search')

        if (err) {
          done()
        } else {
          t.equals(sent['results_receive'].hits.length, 1, 'correct number of hits for search')
          done()
        }
      })
    }

    function searchandfilter () {
      const data = {
        query: 'cat',
        tags: ['kittiluminati']
      }

      const sent = {}

      function send (msg, payload, cb) {
        sent[msg] = payload
        cb()
      }

      effect(data, state, send, (err) => {
        t.error(err, 'run tag filter')

        if (err) {
          done()
        } else {
          t.equals(sent['results_receive'].hits.length, 1, 'correct number of hits for tag filter')
          done()
        }
      })
    }

    function emptysearch () {
      const sent = {}

      function send (msg, payload, cb) {
        sent[msg] = payload || true
        cb()
      }

      effect({}, state, send, (err) => {
        if (err) throw err
        t.ok(sent['results_clear'], 'empty search clears results')
        done()
      })
    }
  }
})
