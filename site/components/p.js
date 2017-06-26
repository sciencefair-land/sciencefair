const html = require('choo/html')

const className = opts => {
  return `f3 w-80-ns lh-copy ph5-ns ${opts.dark ? 'dark' : 'light'}-gray center tc`
}

module.exports = opts => html`

<p class="${className(opts)}">
  ${opts.content}
</p>

`
