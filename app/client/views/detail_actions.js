const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../lib/constants')
const icon = require('./icon')
const mean = require('lodash/mean')
const copy = require('copy-paste').copy

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

const sharebtn = (paper, emit) => {
  const btn = html`

  <div class="${style.button} clickable">
    share ${icon({ name: 'share' })}
  </div>

  `

  btn.onclick = e => {
    e.preventDefault()
    // TODO: move url generation to paper
    const doiurl = `http://doi.org/${paper.id}`
    copy(doiurl, () => emit('note_add', {
      title: 'Article share',
      message: `URL copied to clipboard: ${doiurl}`
    }))
  }

  return btn
}

const deletebtn = (selected, emit) => {
  const btn = html`

  <div class="${style.button} clickable">
    delete ${icon({ name: 'close' })}
  </div>

  `

  btn.onclick = e => {
    e.preventDefault()
    emit('collection:remove-paper', state.selection.list)
  }

  return btn
}

module.exports = (state, emit) => {
  const selected = state.selection.list
  const share = selected.length === 1 ? sharebtn(selected[0], emit) : null

  const progress = mean(selected.map(p => p.progress))
  const del = progress === 100 ? deletebtn(selected, emit) : null

  return html`

  <div class="${style.actions}">
    ${require('./download_read_btn')(state, emit)}
    ${share}
    ${del}
  </div>

  `
}
