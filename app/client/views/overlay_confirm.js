const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../constants')

const style = css`

.overlay {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgb(0, 0, 0);
  display: flex;
  align-items: center;
  justify-content: center;
}

.question {
  width: 400px;
  max-height: 50%;
  display: flex;
  flex-direction: column;
  color: ${C.LIGHTGREY};
  font-family: CooperHewitt-Light;
}

.question > h2 {
  justify-content: center;
}

.buttons {
  margin-top: 50px;
  justify-content: space-around;
  flex-direction: row;
  width: 100%;
}

.button {
  width: 120px;
  height: 60px;
  font-size: 2em;
  margin: 0;
  align-items: center;
  justify-content: center;
  background: ${C.LIGHTGREY};
  color: ${C.DARKBLUE};
  border-radius: 3px;
  padding-top: 10px;
}

.button:hover {
  background: ${C.YELLOW};
}

`

module.exports = (msg, cb) => {
  let destroy

  const yesbtn = html`<div class="${style.button}">YES</div>`
  yesbtn.onclick = e => {
    e.preventDefault()
    destroy()
    cb(true) // eslint-disable-line
  }

  const nobtn = html`<div class="${style.button}">NO</div>`
  nobtn.onclick = e => {
    e.preventDefault()
    destroy()
    cb(false) // eslint-disable-line
  }

  const question = html`

  <div class="${style.question}">
    <h2>${msg}</h2>
    <div class="${style.buttons}">
      ${yesbtn}
      ${nobtn}
    </div>
  </div>

  `

  const overlay = html`

  <div class="${style.overlay}">
    ${question}
  </div>

  `

  destroy = () => document.body.removeChild(overlay)
  document.body.appendChild(overlay)
}
