const html = require('choo/html')

const className = [
  'no-underline',
  'bg-animate',
  'hover-bg-light-blue',
  'silver',
  'hover-dark-gray',
  'pl',
  'pw1'
].join(' ')

module.exports = opts => html`

<a class="${className}" href="${opts.href}">${opts.content}</a>

`
