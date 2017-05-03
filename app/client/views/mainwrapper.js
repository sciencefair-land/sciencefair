const html = require('choo/html')

module.exports = (state, emit, content) => html`

<body>
  <div>
    ${require('./titlebar')()}
    ${content}
    ${require('./notification')(state, emit)}
  </div>
</body>

`
