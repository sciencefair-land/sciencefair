const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../lib/constants')
const includes = require('lodash/includes')
const every = require('lodash/every')

const style = css`

.button {
  justify-content: flex-end;
  justify-items: flex-end;
  align-items: flex-end;
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

.content {
  width: 100%;
  padding: 6px;
}

.outerbar {
  width: 100%;
  height: 10px;
}

.innerbar {
  background: ${C.YELLOW};
}

`

module.exports = (state, prev, send) => {
  const selected = state.results.filter(
    p => includes(state.selection.papers, p.id)
  )
  const alldownloaded = every(selected.map(p => p.downloaded))

  let progress
  if (alldownloaded) {
    progress = 100
  } else {
    // console.log('selected ids', state.selection.papers)
    // console.log('download ids', state.downloads.list)
    const downloads = state.downloads.list.filter(
      d => includes(state.selection.papers, d.id)
    )
    // console.log(downloads)
    const sum = downloads.map(d => d.progress).reduce((a, b) => a + b, 0)
    progress = sum / downloads.length * 100
  }

  const progressbar = html`

  <div class="${style.outerbar}">
    <div class="${style.innerbar}" style="width: ${progress}%;"/>
  </div>

  `

  const btn = html`

  <div class="${style.button} clickable">
    <div style="${style.content}">
      download
    </div>
    ${progressbar}
  </div>

  `

  btn.onclick = e => {
    e.preventDefault
    send('download_add', selected)
  }

  return btn
}
