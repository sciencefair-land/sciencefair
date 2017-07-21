const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../constants')
const speed = require('./speed')

const style = css`

.footer {
  position: absolute;
  height: 70px;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background: ${C.DARKBLUE};
  color: ${C.YELLOWFADE};
  font-family: CooperHewitt-Light;
  font-size: 130%;
}

.part {
  height: 100%;
  width: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
}

.left {
  margin-left: 20px;
}

.right {
  justify-content: flex-end;
}

.toggletab {
  background: ${C.GREYBLUE};
  width: 80px;
}

.n {
  font-size: 1.3em;
}

.offline {
  align-self: center;
  color: ${C.LIGHTGREY};
  font-size: 1.3em;
  opacity: 0.6;
}

`

module.exports = (state, emit) => {
  const online = state.online || state.downloads.speed.up || state.downloads.speed.down
  const downloads = html`

  <div class="${style.left} ${style.part}">
    ${
      online
      ? speed(state.downloads.speed)
      : html`<div class="${style.offline}">offline</div>`
    }
  </div>

  `

  const results = html`

  <div class="${style.part}">
    <div class=${style.n}>
      ${state.results.length}
    </div>
    <div>results</div>
  </div>

  `

  const collectioncount = html`

  <div class="${style.part} clickable">
    <div class=${style.n}>${state.collectioncount}</div>
    <div>saved</div>
  </div>

  `

  collectioncount.onclick = (e) => {
    e.preventDefault()
    emit('search:set-query-string', '*')
  }

  const sources = state.datasources.list.filter(ds => ds.active)
  const datasource = html`

  <div class="${style.right} ${style.part} clickable">
    <div class=${style.n}>${sources.length}</div>
    <div>datasources</div>
  </div>

  `

  datasource.onclick = (e) => {
    e.preventDefault()
    emit('datasources:toggle-shown')
  }

  return html`

  <div class="${style.footer}">
    ${downloads}
    ${results}
    ${collectioncount}
    ${datasource}
    <div class="${style.part} ${style.toggletab}">
      ${require('./toggledetail')(state, emit)}
    </div>
  </div>

  `
}
