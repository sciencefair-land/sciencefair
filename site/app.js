const choo = require('choo')

const app = choo()

app.route('/', require('./components/home'))
app.mount('body')
