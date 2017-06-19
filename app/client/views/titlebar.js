const html = require('choo/html')
const css = require('csjs-inject')

const style = css`

.titlebar {
  position: absolute;
  top: 2px;
  right: 10px;
  width: 160px;
  font-family: Aleo-Light;
  justify-content: flex-end;
  font-size: 130%;
  opacity: 0.7;
  -webkit-app-region: drag;
  -webkit-user-select: none;
  -webkit-app-region: drag;
}

`

module.exports = (state, emit) => {
  const bar = html`

  <div class="${style.titlebar} clickable">
    ${require('./logo')()}
  </div>

  `

  bar.onclick = () => emit('about:show')

  return bar
}
