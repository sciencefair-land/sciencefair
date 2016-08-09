const path = require('path')

const test = require('tape')
const tmp = require('temporary')
const rimraf = require('rimraf')

const catpapers = require('../mocks/cats.json')

const tmpdir = new tmp.Dir()
const dbpath = path.join(tmpdir.path, 'yuno')

test('hyperdrive', (t) => {
  // TODO: write these
})
