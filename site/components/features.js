const section = require('./section')
const h1 = require('./h1')
const list = require('./list')

const entries = [
  'Search, collect, read and analyse scientific papers.',
  'Clean, modern user interface.',
  'Rich interactive reading experience.',
  'Distributed data store.',
  'Control the datasources you use.',
  'Text-mining ready corpus.'
]

const content = () => [
  h1({ content: 'Features', dark: true }),
  list({ entries: entries })
]

module.exports = opts => section({
  section: 'features',
  content: content()
})
