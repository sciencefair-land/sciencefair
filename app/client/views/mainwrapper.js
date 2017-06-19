const html = require('choo/html')

module.exports = (state, emit, content) => html`

<body>
  <div>
    ${require('./titlebar')(state, emit)}
    ${content}
    ${require('./notification')(state, emit)}
  </div>
</body>

`
