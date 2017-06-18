const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../lib/constants')

const style = css`

.overlay {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  width: 50%;
  min-width: 600px;
  max-height: 50%;
  background: ${C.BLUE};
  display: flex;
  flex-direction: column;
  align-items: flex-start;

}

.header {
  letter-spacing: 1px;
  width: 100%;
  padding: 30px;
  background: ${C.MIDBLUE};
  color: ${C.LIGHTGREY};
  margin: 0;
  align-items: center;
  font-family: Aleo-Regular;
}

`

module.exports = (state, emit, opts) => {
  const overlay = html`

  <div class="${style.overlay}">
    <div class="${style.container}">
      <h1 class="${style.header}">${opts.title}</h1>
      ${opts.content}
    </div>
  </div>

  `

  if (opts.onclick) overlay.onclick = opts.onclick

  return overlay
}
