const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../lib/constants')
const icon = require('./icon')

module.exports = (state, prev, send) => {
  const style = css`

  .button {
    justify-content: center;
    align-items: center;
    border: 1px solid ${C.LIGHTGREY};
    border-radius: 2px;
    color: ${C.LIGHTGREY};
    font-family: CooperHewitt-Light;
    font-size: 1.5em;
    margin-right: 12px;
    padding: 6px;
    padding-top: 9px;
  }

  .actions {
    width: 100%;
    justify-content : flex-end;
    padding-top: 10px;
  }

  `

  const sharebtn = html`
    <div class="${style.button} clickable">
      share ${icon({ name: 'share' })}
    </div>
  `
  sharebtn.onclick = (e) => {
    e.preventDefault()
    const doiurl = `http://doi.org/${state.selection.list[0].id}`
    require('copy-paste').copy(doiurl, () => send('note_add', {
      title: 'Article share',
      message: `URL copied to clipboard: ${doiurl}`
    }))
  }

  const actiondiv = html`

  <div class="${style.actions}">
    ${require('./download_read_btn')(state, prev, send)}
    ${sharebtn}
  </div>

  `

  return actiondiv
}
