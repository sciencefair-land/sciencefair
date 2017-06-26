const html = require('choo/html')

module.exports = opts => html`

<li class="f3 f2-ns pv2 silver">
  <img src="./assets/hex-${opts.dark ? 'light' : 'dark'}.svg" width="50" height="50" />
</li>

`
