const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../lib/constants')
const imgpath = require('../lib/imgpath')

const style = css`

.clear {
  position: absolute;
  padding: 5px;
  right: 8px;
  top: 0;
  width: 20px;
  height: 30px;
  background-color: ${C.DARKBLUE};
  -webkit-mask: url(${imgpath('close.svg')}) center / contain no-repeat;
}

`

module.exports = (state, emit) => {
  if (state.search.querystring) {
    const btn = html`<div id="search-clear-btn" class="${style.clear} clickable"></div>`

    btn.onclick = e => {
      e.preventDefault()
      emit('search:clear')
    }

    return btn
  } else {
    return null
  }
}
