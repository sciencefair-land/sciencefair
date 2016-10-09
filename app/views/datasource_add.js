const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../lib/constants')

const style = css`

.container {
  width: 100%;
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

.add {
  font-weight: normal;
}


`

module.exports = (state, prev, send) => {
  const input = html`

  <input class="${style.input}" placeholder="datasource key" />

  `

  input.onkeydown = e => {
    if (e.keyCode === 13) {
      send('datasource_add', { key: input.value, loading: true })
      input.value = ''
    }
  }

  const field = html`

  <div class="${style.container}">
    <div><h3 class="${style.add}">add a datasource:</h3></div>
    ${input}
  </div>

  `

  return field
}
