const html = require('choo/html')
const css = require('csjs-inject')

const style = css`

.titlebar {
  position: absolute;
  top: 2px;
  right: 10px;
  left: 0;
  height: 30px;
  -webkit-user-select: none;
  -webkit-app-region: drag;
}

.toplogo {
  position: absolute;
  right: 0;
  top: 0;
  width: 160px;
  font-family: Aleo-Light;
  justify-content: flex-end;
  font-size: 130%;
  opacity: 0.7;
}

`

module.exports = (state, emit) => {
  const toplogo = html`

  <div class="${style.toplogo} clickable">
    ${require('./logo')()}
  </div>

  `

  toplogo.onclick = () => emit('about:show')

  return html`<div class="${style.titlebar}">${toplogo}</div>`
}
