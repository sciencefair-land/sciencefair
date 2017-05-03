const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../lib/constants')
const icon = require('./icon')
const mean = require('lodash/mean')

module.exports = (state, emit) => {
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
    margin-bottom: 12px;
    padding: 6px;
    padding-top: 9px;
  }

  .actions {
    width: 100%;
    justify-content: flex-end;
    flex-wrap: wrap;
    padding-top: 10px;
  }

  `
  const selected = state.selection.list

  const sharebtn = selected.length === 1 ? html`

  <div class="${style.button} clickable">
    share ${icon({ name: 'share' })}
  </div>

  ` : null

  if (sharebtn) {
    sharebtn.onclick = e => {
      e.preventDefault()
      const doiurl = `http://doi.org/${state.selection.list[0].id}`
      require('copy-paste').copy(doiurl, () => emit('note_add', {
        title: 'Article share',
        message: `URL copied to clipboard: ${doiurl}`
      }))
    }
  }

  const downloads = selected.map(
    p => {
      return { paper: p, download: state.downloads.lookup[p.key] }
    }
  )
  const progressstats = downloads.map(
    obj => obj.download || obj.paper
  )
  const progress = mean(progressstats.map(dl => dl.progress || 0))

  const deletebtn = progress === 100 ? html`

  <div class="${style.button} clickable">
    delete ${icon({ name: 'close' })}
  </div>

  ` : null

  if (deletebtn) {
    deletebtn.onclick = (e) => {
      e.preventDefault()
      emit('collection:remove-paper', state.selection.list)
    }
  }

  const actiondiv = html`

  <div class="${style.actions}">
    ${require('./download_read_btn')(state, emit)}
    ${sharebtn}
    ${deletebtn}
  </div>

  `

  return actiondiv
}
