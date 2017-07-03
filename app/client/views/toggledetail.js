const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../constants')
const imgpath = require('../lib/imgpath')

module.exports = (state, emit) => {
  var action = state.detailshown ? 'hide' : 'show'

  const style = css`

  .button {
    padding: 5px;
    width: 40px;
    height: 40px;
    background-color: ${C.YELLOW};
    -webkit-mask: url(${imgpath(`${action}detail.svg`)}) center / contain no-repeat;
  }

  `

  var button = html`<div class="${style.button} clickable"></a>`

  button.onclick = e => {
    e.preventDefault()
    emit('detail:toggle')
  }

  return button
}
