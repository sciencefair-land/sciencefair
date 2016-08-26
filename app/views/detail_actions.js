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
    margin-left: 12px;
    margin-top: 30px;
    padding: 6px;
    padding-bottom: 1px;
  }

  .actions {
    justify-items: flex-end;
  }

  .downloaded {

  }

  .loading {

  }

  .notdownloaded {

  }

  `

  function getdownloadbtn () {
    let dlclass
    if (state.selection.downloaded === 'loading') {
      // show spinner or something
      // grey out read button
      dlclass = style.loading
    } else if (state.selection.downloaded === 'downloaded') {
      // grey out the button with a little tick
      // show read button in full
      dlclass = style.downloaded
    } else {
      // show the button
      // grey out 'read' button
      dlclass = style.notdownloaded
    }

    const downloadbtn = html`
      <div class="${style.button} ${dlclass} clickable">
        download
      </div>
    `

    downloadbtn.onclick = (e) => {
      e.preventDefault()
      send('selection_download')
    }
  }

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
    ${getdownloadbtn()}
    ${getreadbtn()}
    ${sharebtn}
  </div>

  `

  return actiondiv
}
