const html = require('choo/html')

const divclass = 'fl w-100 w-third-ns pa2'

const aclass = [
  'f3',
  'link',
  'ba',
  'mb2',
  'dib',
  'grow',
  'bg-dark-gray',
  'b--dark-gray',
  'light-gray',
  'w-90',
  'pa2'
].join(' ')

module.exports = section => html`

<div class="${divclass}">
  <a class="${aclass}" href="#${section}">${section}</a>
</div>

`
