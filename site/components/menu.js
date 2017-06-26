const html = require('choo/html')
const menubtn = require('./menubtn')

const sections = [
  'install',
  'features',
  'technology',
  'community'
]

module.exports = () => html`

<div class="w-90 mv4 center ph3-ns">
  <div class="cf ph2-ns">
    ${sections.map(menubtn)}
  </div>
</div>

`
