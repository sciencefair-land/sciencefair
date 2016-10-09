const C = require('../lib/constants')
const mkdirp = require('mkdirp').sync
const path = require('path')
const yuno = require('yunodb')
const after = require('lodash/after')

mkdirp(C.DATAROOT)
mkdirp(C.COLLECTION_PATH)

if (process.env['SCIENCEFAIR_DEVMODE']) {
  require('debug-menu').install()
  // require('../mocks/populated_collection')({}, (err, local) => {
  //   if (err) throw err
  //
  //   local.close(start)
  // })
}
start()

function start () {
  const requireDir = require('require-dir')
  const choo = require('choo')
  const app = choo()

  const model = {
    state: {
      results: [],
      tags: {
        tags: {},
        showAddField: false,
        loaded: false
      },
      datasources: [
        {
          name: 'eLife Official Feed',
          shortName: 'eLife',
          url: 'http://elifesciences.org',
          key: 'blahblahblah',
          active: true,
          live: true,
          size: 1234
        },
        {
          name: 'Europe PubMed Central Official Feed',
          shortName: 'EuropePMC',
          url: 'http://europepmc.org',
          key: 'plehplehpleh',
          active: true,
          live: true,
          size: 1300000
        }
      ],
      detailshown: false,
      autocompleteshown: false,
      currentsearch: {
        query: '',
        tagquery: null,
        tags: []
      },
      contentserver: require('../lib/contentServer')(C.DATAROOT),
      collectioncount: 0,
      selection: {
        reference: null,
        papers: [],
        downloaded: 'loading'
      },
      reader: {
        visible: false,
        paper: null
      }
    },
    effects: requireDir('./effects'),
    reducers: requireDir('./reducers')
  }

  const loadDataSource = (key, cb) => {
    const source = model.state.datasources[key]

    if (!source.loaded) {
      source.dir = path.join(C.DATASOURCES_PATH, key)
      mkdirp(source.dir)
      source.dbdir = path.join(source.dir, 'db')
      mkdirp(source.dbdir)

      const dbopts = {
        location: source.dbdir,
        keyField: '$.identifier[0].id',
        indexMap: {
          'title': true,
          'author': true,
          'date': false,
          'identifier': false,
          'abstract': true
        }
      }

      yuno(dbopts, (err, db) => {
        if (err) cb(err)

        source.db = db
        source.loaded = true
        cb()
      })
    }
  }

  require('../lib/localcollection')((err, db) => {
    if (err) throw err

    model.state.collection = db

    app.model(model)

    app.router('/', (route) => [
      route('/', require('./views/home'))
    ])

    const keys = Object.keys(model.state.datasources)

    function startapp () {
      const tree = app.start()
      document.body.appendChild(tree)
    }

    if (keys.length === 0) return startapp()

    const cb = after(keys.length, startapp)

    keys.forEach(key => loadDataSource(key, cb))
  })
}
