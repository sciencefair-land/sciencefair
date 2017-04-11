const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../lib/constants')
const imgpath = require('../lib/imgpath')

const style = css`

.wrapper {
  position: relative;
  align-items: center;
}

.input {
  height: 30px;
  border: none;
  border-bottom: dotted 2px ${C.YELLOW};
  color: ${C.YELLOW};
  margin-left: 10px;
  padding-right: 30px;
  font-size: 90%;
  font-family: Aleo-Light;
  background: none;
  display: flex;
  outline: none;
}

.input::-webkit-input-placeholder {
   color: ${C.LIGHTGREY};
}

.cancel {
  padding: 5px;
  width: 20px;
  height: 20px;
  background-color: ${C.YELLOW};
  -webkit-mask: url(${imgpath('close.svg')}) center / contain no-repeat;
}

`

module.exports = (state, emit) => {
  if (!(state.tags.showAddField)) return

  const input = html`<input class="${style.input}" placeholder="new tag name..">`

  function submit (e) {
    e.preventDefault()
    emit('tags:add', e.target.value)
  }

  input.onkeypress = (e) => {
    if (!e) e = window.e
    var keyCode = e.keyCode || e.which
    if (keyCode === 13) submit(e)
  }

  const closebtn = html`<div class="${style.cancel} clickable"></div>`

  closebtn.onclick = (e) => {
    e.preventDefault()
    emit('tags:stop-add')
  }

  setTimeout(() => {
    input.focus()
  }, 200)

  return html`<div class="${style.wrapper}">${input}${closebtn}</div>`
}
