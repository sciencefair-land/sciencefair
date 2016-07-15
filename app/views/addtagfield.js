const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../constants')

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
  -webkit-mask: url(./images/close.svg) center / contain no-repeat;
}

`

module.exports = (state, prev, send) => {
  if (!(state.tags.showAddField)) return

  const input = html`<input class="${style.input}" placeholder="new tag name..." />`

  function submit () {
    const payload = { tag: input.value, paper: state.selectedpaper }

    send('tag_add', payload, (err) => {
      if (err) console.log(err)
    })

    send('tag_stopadd')
  }

  input.onkeypress = (event) => {
    if (!event) event = window.event
    var keyCode = event.keyCode || event.which
    if (keyCode === 13) submit()
  }

  const closebtn = html`<div class="${style.cancel} clickable"></div>`

  closebtn.onclick = () => { send('tag_stopadd') }

  return html`<div class="${style.wrapper}">${input}${closebtn}</div>`
}
