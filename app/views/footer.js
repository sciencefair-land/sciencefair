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
  align-items: center;
  padding: 0px 20px;
}

.left {
  width: 200px;
}

.mid {
  width: calc(100% - 200px);
  justify-content: center;
}

.right {
  justify-content: flex-end;
  width: 250px;
}

.toggletab {
  background: ${C.GREYBLUE};
}

.logo {
  height: 70px;
  width: 60px;
  background-color: ${C.LIGHTGREY};
  -webkit-mask: url(./images/elife.svg) center / contain no-repeat;
}

`

module.exports = (state, prev, send) => {
  const collectioncount = html`
  <div class="${style.mid} ${style.part} clickable">
    ${state.collectioncount} papers in collection
  </div>
  `

  collectioncount.onclick = (e) => {
    e.preventDefault()
    send('search_setquerystring', { query: '*' })
    send('search_populate', '*')
  }

  const datasource = html`
  <div class="${style.right} ${style.part}">
    <img class="${style.logo}">
  </div>
  `

  datasource.onclick = (e) => {
    e.preventDefault()
    send('datasource_selector_toggle')
  }

  return html`

  <div class="${style.footer}">
    <div class="${style.left} ${style.part}">0 MB/s</div>
    <div class="${style.mid} ${style.part}">
      ${state.results.length} results (${state.selection.papers.length} selected)
    </div>
    ${collectioncount}
    ${datasource}
    <div class="${style.part} ${style.toggletab}">
      ${require('./toggledetail')(state, prev, send)}
    </div>
  </div>

  `
}
