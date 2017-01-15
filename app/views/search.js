const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../lib/constants')

const style = css`

.search {
  height: 30px;
  width: 80%;
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

const placeholders = [
  'try:   a word or phrase',
  'try:   a word or phrase   ..or..   #',
  'try:   a word or phrase   ..or..   #   ..or..   *'
]

var clearing = false

module.exports = (state, prev, send) => {
  if (state.initialising) return null

  const placeidx = Math.min(state.collectioncount, 2)
  const placeholder = placeholders[placeidx]
  const input = html`

  <input class="${style.input}" placeholder="${placeholder}"
   autofocus>

  `

  if (state.populatesearch) {
    input.setAttribute('value', state.populatesearch)
    send('search_populatedone')
  }

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

  function clearbtn () {
    const query = state.currentsearch.query
    const hasquery = query && query.length > 0
    const tags = state.currentsearch.tags
    const hastags = tags && tags.length > 0
    if (hasquery || hastags) {
      const btn = html`<div class="${style.clear} clickable"></div>`

      btn.onclick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        clearing = true
        send('search_clear')
      }

      return btn
    } else {
      return ''
    }
  }

  return html`

  <div class="${style.search}">
    <div class="${style.wrapper}">
      ${input}
      ${tags}
      ${clearbtn()}
      <img class="${style.img}" src="./images/search.svg" />
      ${require('./autocomplete')(state, prev, send)}
    </div>
  </div>

  `
}
