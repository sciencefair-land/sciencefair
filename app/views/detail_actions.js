const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../lib/constants')

module.exports = (state, prev, send) => {
  const style = css`

  .button {
    justify-content: flex-end;
    justify-items: flex-end;
    align-items: flex-end;
    border: 1px solid ${C.LIGHTGREY};
    padding: 5px;
    border-radius: 2px;
    color: ${C.LIGHTGREY};
    font-family: CooperHewitt-Medium;
    font-size: 1.5em;
    margin-left: 12px;
    margin-top: 30px;
    padding: 6px;
    padding-bottom: 1px;
  }

  .actions {
    position: absolute;
    top: 15px;
  }

  `


  function getreadbtn () {
    if (state.selection.papers.length === 1) {
      const readbtn = html`
        <div class="${style.button} clickable">
          read
        </div>
      `

      readbtn.onclick = (e) => {
        e.preventDefault()
        send('read_selection')
      }

      return readbtn
    } else {
      return null
    }
  }

  const sharebtn = html`
    <div class="${style.button} clickable">
      share
    </div>
  `
  sharebtn.onclick = (e) => {
    e.preventDefault()
    send('selection_share')
  }

  const actiondiv = html`

  <div class="${style.actions}">
    ${require('./download_btn')(state, prev, send)}
    ${getreadbtn()}
    ${sharebtn}
  </div>

  `

  return actiondiv
}
