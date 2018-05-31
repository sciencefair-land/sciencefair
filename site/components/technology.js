const html = require('choo/html')

const section = require('./section')
const h1 = require('./h1')
const list = require('./list')
const a = require('./a')

const choo = () => a({
  href: 'https://github.com/yoshuawuyts/choo',
  content: 'choo'
})

const electron = () => a({
  href: 'https://electron.atom.io/',
  content: 'electron'
})

const lens = () => a({
  href: 'http://lens.elifesciences.org/about/',
  content: 'lens'
})

const hyperdrive = () => a({
  href: 'https://github.com/mafintosh/hyperdrive',
  content: 'hyperdrive'
})

const searchindex = () => a({
  href: 'https://github.com/fergiemcdowall/search-index',
  content: 'searchindex'
})

const entries = [
  html`<span>Science-focused JATS XML reader provided by ${lens()}.</span>`,
  html`<span>Distributed data sharing using Dat's ${hyperdrive()}.</span>`,
  html`<span>Fast local search index built on ${searchindex()}.</span>`,
  html`<span>Created using web technologies with ${choo()} and ${electron()}.</span>`
]

const content = () => [
  h1({ content: 'Technology', dark: true }),
  list({ entries: entries, dark: false })
]

module.exports = opts => section({
  section: 'technology',
  dark: false,
  content: content()
})
