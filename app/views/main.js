const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../lib/constants')

const style = css`

.main {
  position: absolute;
  top: 30px;
  width: 100%;
  bottom: 0;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  background: ${C.BLUE};
}

`

module.exports = (state, prev, send) => {
  return html`

  <div class="${style.main}">
    ${require('./search')(state, prev, send)}
    ${require('./results')(state, prev, send)}
    ${require('./detail')(state, prev, send)}
    ${require('./footer')(state, prev, send)}
  </div>

  `
}
