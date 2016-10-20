const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../lib/constants')
const icon = require('./icon')

module.exports = (state, prev, send) => {
  const style = css`

  .button {
    justify-content: center;
    justify-items: center;
    align-items: center;
    border: 1px solid ${C.LIGHTGREY};
    padding: 5px;
    border-radius: 2px;
    color: ${C.LIGHTGREY};
    font-family: CooperHewitt-Light;
    font-size: 1.5em;
    margin-right: 12px;
    padding: 6px;
    padding-bottom: 1px;
  }

  .actions {
    width: 100%;
    justify-content : flex-end;
    padding-top: 10px;
  }

  `


  function getreadbtn () {
    if (state.selection.papers.length === 1) {
      const readbtn = html`
        <div class="${style.button} clickable">
          read ${icon({ name: 'read' })}
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
      share ${icon({ name: 'share' })}
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
