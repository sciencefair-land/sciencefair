const C = require('./lib/constants')
const mkdirp = require('mkdirp').sync

mkdirp(C.DATAROOT)
mkdirp(C.COLLECTION_PATH)

// if (process.env['SCIENCEFAIR_DEVMODE']) require('debug-menu').install()
require('debug-menu').install()

start()

function start () {
  const requireDir = require('require-dir')
  const choo = require('choo')
  const app = choo({
    onError: (err, state, createSend) => {
      if (/ENOENT/.test(err.message)) return // ugly hack to stop annoying error bubble
      console.groupCollapsed(`ERROR (non-fatal) handled by sciencefair: ${err.message}`)
      console.error(err)
      console.groupEnd()

      const send = createSend('onError: ')
      if (err) send('note_add', {
        title: 'Error',
        message: err.message
      }, () => {})
    }
  })

  const model = {
    state: require('./state'),
    effects: requireDir('./effects'),
    reducers: requireDir('./reducers'),
    subscriptions: requireDir('./subscriptions')
  }

  require('./lib/localcollection')((err, db) => {
    if (err) throw err

    model.state.collection = db

    app.model(model)

    app.router([
      ['/', require('./views/home')]
    ])

    app.mount('body')
  })
}

require('electron').ipcRenderer.on('quitting', () => {
  console.log('APP QUITTING')
  require('./lib/getdatasource').all().forEach(d => d.close())
})
