
const mockhyper = done => {
  var hyperdrive = require('hyperdrive')
  var level = require('level')
  var raf = require('random-access-file')
  var walker = require('folder-walker')
  var untildify = require('untildify')
  var through = require('through2')

  var dir = __dirname + '/../mocks/'

  var drive = hyperdrive(level('science-fair-elife.db'))
  var archive = drive.createArchive({
    live: true,
    file: function (name) {
      return raf(dir + name) // assuming elife is in ./elife
    }
  })

  var key = archive.discoveryKey

  walker(dir).pipe(through.obj(visit)).on('finish', () => {
    console.log('your key', archive.key.toString('hex'))

    var discovery = require('discovery-swarm')
    var defaults = require('datland-swarm-defaults')

    var swarm = discovery(defaults({
      hash: false,
      stream: function () {
        return archive.replicate()
      }
    }))

    key = archive.discoveryKey

    swarm.join(archive.discoveryKey)
    cb(key)
  })

  function visit (data, enc, cb) {
    console.log('appending to feed:', data.relname)
    archive.append({ type: data.type, name: data.relname }, cb)
  }
}


const path = require('path')

const test = require('tape')
const tmp = require('temporary')

const catpapers = require('../mocks/cats.json')

const tmpdir = new tmp.Dir()
const dbpath = path.join(tmpdir.path, 'yuno')

test('hyperdrive', (t) => {
  // TODO: write these
})
