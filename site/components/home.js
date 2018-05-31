const html = require('choo/html')

module.exports = () => html`

<body class="bg-light-gray roboto">
  ${require('./header')()}
  ${require('./features')()}
  ${require('./install')()}
  ${require('./technology')()}
  ${require('./community')()}
</body>

`
