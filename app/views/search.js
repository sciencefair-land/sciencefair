const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../constants')

const style = css`

.search {
  height: 30px;
  width: 100%;
  bottom: 0;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: row;
  background: ${C.BLUE};
}

.wrapper {
  position: relative;
  margin: 50px;
  width: 100%;
  height: 50px;
  display: flex;
}

.input {
  width: 80%;
  height: 30px;
  border: none;
  border-bottom: dotted 2px ${C.DARKBLUE};
  font-size: 130%;
  padding-left: 40px;
  padding-bottom: 5px;
  font-family: CooperHewitt-Book;
  background: none;
  display: flex;
  outline: none;
}

.img {
  position: absolute;
  left: 2px;
  margin-top: 2px;
  margin-left: 2px;
  z-index: 900;
}

`

module.exports = (state, prev, send) => {
  const input = html`<input class="${style.input}" />`

  input.oninput = () => send('search_input', { query: input.value })

  return html`

  <div class="${style.search}">
    <div class="${style.wrapper}">
      ${input}
      <img class="${style.img}" src="./images/search.svg" />
    </div>
  </div>

  `
}
