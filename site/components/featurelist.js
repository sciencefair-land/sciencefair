const html = require('choo/html')
const feature = require('./feature')
const listify = opts => {
  const list = []
  opts.entries.forEach(entry => list.push(feature(entry)))
  return list
}

module.exports = opts => html`

<ul class="center w-80 w-80-ns pa3 border-box list cf ph2-ns tc">
  ${listify(opts)}
</ul>

`
