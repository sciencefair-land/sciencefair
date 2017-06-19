require('./lib/setup')
require('./lib/contentserver')

const choo = require('choo')
const app = choo({ href: false })

app.use(require('choo-asyncify'))
app.use(require('./models/error'))
app.use(require('choo-log')())

app.use(require('./models/renderer'))

app.use(require('./models/about'))
app.use(require('./models/collection'))
app.use(require('./models/datasources'))
app.use(require('./models/defaultsources'))
app.use(require('./models/detail'))
app.use(require('./models/downloads'))
app.use(require('./models/main'))
app.use(require('./models/online'))
app.use(require('./models/notification'))
app.use(require('./models/paper'))
app.use(require('./models/reader'))
app.use(require('./models/results'))
app.use(require('./models/search'))
app.use(require('./models/selection'))
app.use(require('./models/tags'))

app.route('#', require('./views/start'))
app.route('#home', require('./views/home'))
app.route('#initial', require('./views/initial'))
app.route('#reader', require('./views/reader'))

app.mount('body')
