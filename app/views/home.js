const html = require('choo/html')

module.exports = (state, prev, send) => {
  return html`
    <div>
      ${require('./titlebar')(state, prev, send)}
      ${require('./main')(state, prev, send)}
    </div>
  `
}
