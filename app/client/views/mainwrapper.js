const html = require('choo/html')

module.exports = (state, emit, content) => html`

<body>
  <div>
    ${require('./titlebar')(state, emit)}
    ${content}
    ${require('./about')(state, emit)}
    ${require('./notification')(state, emit)}
  </div>
</body>

`
