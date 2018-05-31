const html = require('choo/html')
const menubtn = require('./menubtn')

const sections = [
  'features',
  'install',
  'community'
]

module.exports = () => html`

<div class="w-70 mv4 center ph2-ns">
  <div class="cf ph2-ns">
    ${sections.map(menubtn)}
  </div>
</div>

`
