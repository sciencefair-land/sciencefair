const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../constants')
const mean = require('lodash/mean')
const icon = require('./icon')
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
  const justone = selected.length === 1
  const downloading =
       any(selected.map(p => p.downloading)) &&
    all(selected.map(p => p.minprogress() > 0))

  const progress = mean(selected.map(p => p.minprogress()))
  const finished = progress === 100

  const donetext = justone ? 'read' : 'downloaded'
  const doneicon = justone ? 'read' : 'tick'

  const nodltxt = finished ? donetext : 'download'
  const btntext = downloading ? 'downloading' : nodltxt
  const btnicon = finished ? doneicon : 'download'

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
    if (finished) {
      if (selected.length > 1) return
      emit('reader:read', selected[0])
    } else {
      emit('downloads:add', selected)
    }
  }

  return btn
}
