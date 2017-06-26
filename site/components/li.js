const html = require('choo/html')

module.exports = opts => html`

<li class="f3 lh-copy pv2 ${opts.dark ? 'light' : 'mid'}-gray">${opts.content}</li>

`
