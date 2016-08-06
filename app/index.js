var requireDir = require('require-dir')

const DEVMODE = !!(process.env['SCIENCEFAIR_DEVMODE'])
if (DEVMODE) {
  require('debug-menu').install()
  // require('./lib/dev/populate_collection')
}

const C = require('./constants')
const mkdirp = require('mkdirp').sync
mkdirp(C.DATAROOT)
mkdirp(C.COLLECTION_PATH)

const choo = require('choo')
const app = choo()

const model = {
  state: {
    results: [],
    tags: { tags: {}, showAddField: false },
    datasources: [
      {
        name: 'eLife',
        search: (q) => { console.log(q) }
      }
    ],
    collection: require('./lib/localcollection'),
    detailshown: true,
    currentsearch: { query: '', tags: [] }
  },
  effects: requireDir('./effects'),
  reducers: requireDir('./reducers')
}

console.log(model)

app.model(model)

app.router('/', (route) => [
  route('/', require('./views/home'))
])

const tree = app.start()
document.body.appendChild(tree)
