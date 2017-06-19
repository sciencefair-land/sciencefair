const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../lib/constants')

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
  -webkit-app-region: no-drag;
}

`

module.exports = (state, emit) => html`

<div class="${style.main}">
  ${require('./search')(state, emit)}
  ${require('./results')(state, emit)}
  ${require('./message')(state, emit)}
  ${require('./detail')(state, emit)}
  ${require('./footer')(state, emit)}
  ${require('./about')(state, emit)}
  ${require('./datasource_selector')(state, emit)}
</div>

`
