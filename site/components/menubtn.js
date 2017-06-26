const html = require('choo/html')

const divclass = 'fl w-100 w-25-ns pa2'

const aclass = [
  'w-90',
  'f3',
  'link',
  'ba',
  'ph3',
  'pv2',
  'mb2',
  'dib',
  'grow',
  'bg-dark-gray',
  'b--dark-gray',
  'light-gray'
].join(' ')

module.exports = section => html`

<div class="${divclass}">
  <a class="${aclass}" href="#${section}">${section}</a>
</div>

`
