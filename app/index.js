const C = require('../lib/constants')
const mkdirp = require('mkdirp').sync

mkdirp(C.DATAROOT)
mkdirp(C.COLLECTION_PATH)

if (process.env['SCIENCEFAIR_DEVMODE']) require('debug-menu').install()

start()

function start () {
  const requireDir = require('require-dir')
  const choo = require('choo')
  const app = choo({
    onError: (err, state, createSend) => {
      console.groupCollapsed(`Error: ${err.message}`)
      console.error(err)
      console.groupEnd()

      const send = createSend('onError: ')
      if (err) send('error_add', err)
    }
  })

  const model = {
    state: {
      results: [],
      tags: {
        tags: {},
        showAddField: false,
        loaded: false
      },
      datasources: { shown: false, loaded: false, list: [] },
      detailshown: false,
      autocompleteshown: false,
      currentsearch: {
        query: '',
        tagquery: null,
        tags: []
      },
      contentserver: require('../lib/contentserver')(C.DATASOURCES_PATH),
      collectioncount: 0,
      selection: {
        reference: null,
        papers: [],
        downloaded: 'loading'
      },
      reader: {
        visible: false,
        paper: null
      },
      errors: {},
      downloads: {
        totalspeed: 0,
        list: []
      },
      online: false
    },
    effects: requireDir('./effects'),
    reducers: requireDir('./reducers'),
    subscriptions: requireDir('./subscriptions')
  }

  require('../lib/localcollection')((err, db) => {
    if (err) throw err

    model.state.collection = db

    app.model(model)

    app.router('/', (route) => [
      route('/', require('./views/home'))
    ])

    const tree = app.start()
    document.body.appendChild(tree)
  })
}
