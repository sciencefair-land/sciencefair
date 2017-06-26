const html = require('choo/html')

const className = dark => {
  return `w-70 f6 link grow ba pa3 mb2 dib ${dark ? 'dark' : 'light'}-gray`
}

module.exports = opts => html`

<div class="fl w-100 w-25-ns pa2 center tc">
  <a class=${className(opts.dark)} href="${opts.href}">
    ${opts.content}
  </a>
</div>

`
