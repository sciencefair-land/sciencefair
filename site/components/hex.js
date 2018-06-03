const html = require('choo/html')

module.exports = opts => html`

<a href="${opts.href}" target="_blank">
  <img style="opacity: 0.9; width: 169px;" class="hex" src="./assets/hexes/${opts.src}" />
</a>

`
