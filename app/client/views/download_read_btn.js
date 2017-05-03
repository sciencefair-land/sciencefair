const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../lib/constants')
const includes = require('lodash/includes')
const mean = require('lodash/mean')
const icon = require('./icon')
const paper = require('../lib/getpaper')
const all = require('lodash/every')
const any = require('lodash/some')

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
  padding: 13px;
  position: relative;
}

.content {
  width: 100%;
  padding: 6px;
}

.progressbar {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 8px;
  width: 0;
  background-color: ${C.YELLOW};
}

`

module.exports = (state, emit) => {
  const selected = state.selection.list
  const downloading = any(selected.map(p => p.downloading))
    && all(selected.map(p => p.downloading || p.progress === 100))

  const progress = mean(selected.map(p => p.progress || 0))

  const donetext = state.selection.list.length === 1 ? 'read' : 'downloaded'
  const doneicon = state.selection.list.length === 1 ? 'read' : 'tick'

  const btntext = downloading
    ? 'downloading'
    : progress === 100 ? donetext : 'download'
  const btnicon = progress === 100 ? doneicon : 'download'

  const btn = html`

  <div class="${style.button} clickable">
    <div style="${style.content}">
      ${btntext} ${icon({ name: btnicon })}
    </div>
    <div class="${style.progressbar}" style="width: ${progress}%"/>
  </div>

  `

  btn.onclick = e => {
    e.preventDefault()
    if (progress === 100) {
      if (selected.length > 1) return
      emit('reader:read', selected[0])
    } else {
      emit('downloads:add', selected)
    }
  }

  return btn
}
