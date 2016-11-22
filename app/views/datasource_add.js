const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../lib/constants')

const style = css`

.container {
  width: 100%;
  height: 80px;
  flex-direction: column;
  padding: 20px;
}

.input {
  width: 100%;
  height: 30px;
  border: none;
  border-bottom: dotted 2px ${C.DARKBLUE};
  font-size: 130%;
  padding-bottom: 5px;
  font-family: CooperHewitt-Book;
  background: none;
  display: flex;
  outline: none;
}

`

module.exports = (state, prev, send) => {
  const input = html`

  <input type="text" class="${style.input}" placeholder="add a datasource key" />

  `

  input.onkeydown = e => {
    if (e.keyCode === 13) {
      setTimeout(() => {
        const value = input.value
        send('datasource_add', { key: value.trim(), loading: true })
        input.value = ''
      }, 300)
    }
  }

  const field = html`

  <div class="${style.container}">
    ${input}
  </div>

  `

  return field
}
