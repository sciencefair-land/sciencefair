const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../lib/constants')

module.exports = (license, state, prev, send) => {
  if (!license) return null

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
    margin-left: 12px;
    margin-top: 30px;
    padding: 6px;
    padding-bottom: 1px;
  }

  .actions {
    justify-items: flex-end;
  }

  `

  const downloadbtn = html`
    <div class="${style.button} clickable">
      download
    </div>
  `

  downloadbtn.onclick = (e) => {
    e.preventDefault()
    send('selection_download')
  }

  const readbtn = html`
    <div class="${style.button} clickable">
      read
    </div>
  `

  readbtn.onclick = (e) => {
    e.preventDefault()
    send('selection_read')
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
    ${downloadbtn}
    ${readbtn}
    ${sharebtn}
  </div>

  `

  return actiondiv
}
