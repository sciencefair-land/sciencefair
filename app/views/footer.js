const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../lib/constants')

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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-items: center;
  padding: 10px;
}

.left {
  width: 200px;
}

.right {
  justify-content: flex-end;
  width: 250px;
}

.toggletab {
  background: ${C.GREYBLUE};
  width: 80px;
}

.logo {
  height: 70px;
  width: 60px;
  background-color: ${C.LIGHTGREY};
  -webkit-mask: url(./images/elife.svg) center / contain no-repeat;
}

.n {
  font-size: 1.5em;
}

`

module.exports = (state, prev, send) => {
  const downloads = html`

  <div class="${style.left} ${style.part}">
    <div class=${style.n}>
      ${state.downloads.totalspeed}
    </div>
    <div>MB/s</div>
  </div>

  `

  const results = html`

  <div class="${style.part}">
    <div class=${style.n}>
      ${state.results.length} (${state.selection.papers.length})
    </div>
    <div>results (selected)</div>
  </div>

  `

  const collectioncount = html`

  <div class="${style.mid} ${style.part} clickable">
    <div class=${style.n}>${state.collectioncount}</div>
    <div>papers in collection</div>
  </div>

  `

  collectioncount.onclick = (e) => {
    e.preventDefault()
    send('search_setquerystring', { query: '*' })
    send('search_populate', '*')
  }

  const sources = state.datasources.list.filter(ds => ds.active)
  const datasource = html`

  <div class="${style.right} ${style.part} ${style.datasources}">
    <div class=${style.n}>${sources.length}</div>
    <div>datasources</div>
  </div>

  `

  datasource.onclick = (e) => {
    e.preventDefault()
    send('datasource_selector_toggle')
  }

  return html`

  <div class="${style.footer}">
    ${downloads}
    ${results}
    ${collectioncount}
    ${datasource}
    <div class="${style.part} ${style.toggletab}">
      ${require('./toggledetail')(state, prev, send)}
    </div>
  </div>

  `
}
