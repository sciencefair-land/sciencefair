const html = require('choo/html')

module.exports = opts => {
  const shade = opts.dark ? 'dark' : 'light'
  return html`

  <h1 class="w-100 ${shade}-gray f2 tc center">
    ${opts.content}
    <hr class="center mw6 bb bw1 ${shade}-gray ma3">
  </h1>

  `
}
