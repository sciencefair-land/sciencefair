const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../lib/constants')

module.exports = (state, prev, send) => {
  var action = state.detailshown ? 'hide' : 'show'

  const style = css`

  .button {
    padding: 5px;
    width: 40px;
    height: 40px;
    background-color: ${C.YELLOW};
    -webkit-mask: url(./images/${action}detail.svg) center / contain no-repeat;
  }

  `

  var button = html`<div class="${style.button} clickable"></a>`

  button.onclick = () => {
    send('detail_toggle', (err) => { if (err) console.log(err) })
  }

  return button
}
