const html = require('choo/html')

module.exports = opts => html`

<a href="${opts.href}"><img class="hex" src="./assets/hexes/${opts.src}" /></a>

`
