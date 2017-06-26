const html = require('choo/html')

module.exports = () => html`

<body class="bg-light-gray roboto">
  ${require('./header')()}
  ${require('./install')()}
  ${require('./features')()}
  ${require('./technology')()}
  ${require('./community')()}
</body>

`
