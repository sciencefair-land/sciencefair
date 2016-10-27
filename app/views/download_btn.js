const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../lib/constants')
const includes = require('lodash/includes')
const mean = require('lodash/mean')
const icon = require('./icon')

const style = css`

.button {
  justify-content: flex-end;
  justify-items: flex-end;
  align-items: flex-end;
  border: 1px solid ${C.LIGHTGREY};
  border-bottom: none;
  padding: 5px;
  border-radius: 2px;
  color: ${C.LIGHTGREY};
  font-family: CooperHewitt-Light;
  font-size: 1.5em;
  margin-right: 12px;
  padding: 6px;
  padding-bottom: 10px;
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

module.exports = (state, prev, send) => {
  const selected = state.results.filter(
    p => includes(state.selection.papers, p.id)
  )
  const progress = mean(selected.map(p => p.progress || 0))

  const btntext = progress === 100 ? 'downloaded' : 'download'
  const btnicon = progress === 100 ? 'tick' : 'download'

  const btn = html`

  <div class="${style.button} clickable">
    <div style="${style.content}">
      ${btntext} ${icon({ name: btnicon })}
    </div>
    <div class="${style.progressbar}" style="width: ${progress}%"/>
  </div>

  `

  btn.onclick = e => {
    e.preventDefault
    send('download_add', selected)
  }

  return btn
}
