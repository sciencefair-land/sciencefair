const html = require('choo/html')

module.exports = opts => {
  const shade = opts.dark ? 'dark' : 'light'
  const border = opts.noborder ? '' : 'bt bw2'
  const tight = opts.tight ? 'pv0' : ''
  return html`

  <h1 class="w-100 ${shade}-gray f2 tc center ${border} ${tight} pt5 ttu tracked avenir fw4">
    ${opts.content}
  </h1>

  `
}
