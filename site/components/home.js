const html = require('choo/html')

module.exports = () => html`

<body class="bg-near-white roboto">
  ${require('./header')()}
  ${require('./features')()}
  ${require('./install')()}
  ${require('./community')()}
</body>

`
