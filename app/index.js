var requireDir = require('require-dir')
var untildify = require('untildify')

const DEVMODE = !!(process.env['SCIENCEFAIR_DEVMODE'])

const choo = require('choo')
const app = choo()

app.model({
  state: {
    results: DEVMODE ? require('datasouces/test') : [],
    tags: { list: [], showAddField: false },
    datasources: [
      { name: 'eLife' }
    ],
    detailshown: true,
    currentquery: { query: '', tags: [] }
  },
  effects: requireDir('./effects'),
  reducers: requireDir('./reducers')
})

app.router('/', (route) => [
  route('/', require('./views/home'))
])

const tree = app.start()
document.body.appendChild(tree)
