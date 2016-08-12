const C = require('../lib/constants')
const mkdirp = require('mkdirp').sync
mkdirp(C.DATAROOT)
mkdirp(C.COLLECTION_PATH)

if (process.env['SCIENCEFAIR_DEVMODE']) {
  require('debug-menu').install()
  require('../mocks/populated_collection')({}, (err, local) => {
    if (err) throw err

    local.close(start)
  })
} else {
  start()
}

function start () {
  const requireDir = require('require-dir')
  const choo = require('choo')
  const app = choo()

  const model = {
    state: {
      results: [],
      tags: { tags: {}, showAddField: false },
      datasources: [
        {
          name: 'eLife',
          search: (q) => { }
        }
      ],
      detailshown: false,
      autocompleteshown: false,
      currentsearch: { query: '', tags: [] },
      collectioncount: 0,
      selection: {
        reference: null,
        papers: []
      }
    },
    effects: requireDir('./effects'),
    reducers: requireDir('./reducers')
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
