const html = require('choo/html')
const li = require('./li')
const hexpoint = require('./hexpoint')

const listify = opts => {
  const list = []
  opts.entries.forEach((entry, i) => {
    list.push(li({ content: entry, dark: opts.dark }))
    if (i < opts.entries.length - 1) list.push(hexpoint({ dark: opts.dark }))
  })
  return list
}

module.exports = opts => html`

<ul class="list pa0 w-100 tc">
  ${listify(opts)}
</ul>

`
