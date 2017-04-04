const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../lib/constants')
const bytes = require('bytes')

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

.logo {
  height: 70px;
  width: 60px;
  background-color: ${C.LIGHTGREY};
  -webkit-mask: url(./images/elife.svg) center / contain no-repeat;
}

.n {
  font-size: 1.3em;
}

.dl {
  font-size: 1.5em;
  align-self: center;
  margin-top: 10px;
}

.offline {
  margin-top: 4px;
  color: ${C.LIGHTGREY};
  font-size: 0.8em;
  opacity: 0.6;
}

`

module.exports = (state, prev, send) => {
  console.log('footer state', state)
  const downloads = html`

  <div class="${style.left} ${style.part}">
    <div class=${style.dl}>
      ${
          (state.online || state.downloads.totalspeed > 0)
        ? bytes(state.downloads.totalspeed, { unitSeparator: '\n' }) + '/s'
        : html`<div class="${style.offline}">offline</div>`
      }
    </div>
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
    send('search_setquerystring', { query: '*' })
    send('search_populate', '*')
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
