const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../lib/constants')

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
  position: relative;
}

.wrapper {
  position: relative;
  margin: 50px;
  width: 100%;
  height: 50px;
  display: flex;
}

.input {
  width: 100%;
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

.tags {
  position: absolute;
  right: 34px;
}

.clear {
  position: absolute;
  padding: 5px;
  right: 8px;
  top: 0;
  width: 20px;
  height: 30px;
  background-color: ${C.DARKBLUE};
  -webkit-mask: url(./images/close.svg) center / contain no-repeat;
}

`

var clearing = false

module.exports = (state, prev, send) => {
  const input = html`<input class="${style.input}" autofocus>`

  input.oninput = (e) => {
    e.preventDefault()
    send('search_setquerystring', { query: e.target.value })
  }

  if (state.currentsearch.query.trim() === '' && clearing) {
    input.setAttribute('value', '')
    clearing = false
  }

  if (state.currentsearch.striptagquery) {
    input.setAttribute('value', state.currentsearch.query)
    send('search_tagquerystripped')
  }

  const tags = html`

  <div class="${style.tags}">
    ${(state.currentsearch.tags || []).map((tag) => {
      return require('./search_tag')(tag, state, prev, send)
    })}
  </div>

  `

  const clearbtn = html`<div class="${style.clear} clickable"></div>`

  clearbtn.onclick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    clearing = true
    send('search_clear')
  }

  return html`

  <div class="${style.search}">
    <div class="${style.wrapper}">
      ${input}
      ${tags}
      ${clearbtn}
      <img class="${style.img}" src="./images/search.svg" />
      ${require('./autocomplete')(state, prev, send)}
    </div>
  </div>

  `
}
