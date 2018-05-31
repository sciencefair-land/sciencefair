const html = require('choo/html')

const className = opts => {
  return `w-100 center bg-near-white ${opts.dark ? 'dark' : 'light'}-gray pa3 mv3`
}

module.exports = opts => html`

<section id="${opts.section}" class="${className(opts)}">
  ${opts.content}
</section>

`
