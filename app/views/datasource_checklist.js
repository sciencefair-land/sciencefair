const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../lib/constants')

const style = css`

.list {
  width: 100%;
  padding: 30px;
  color: ${C.DARKBLUE};
  flex-direction: column;
}

.entry {
  flex-direction: row;
  height: 40px;
  font-size: 1.3em;
  align-items: center;
  justify-content: space-between;
}

.checkbox {
  width: 30px;
  height: 30px;
  margin-right: 20px;
}

.checked {
  background-color: ${C.MIDBLUE};
  -webkit-mask: url(./images/check.svg) center / contain no-repeat;
}

.unchecked {
  background-color: ${C.MIDBLUE};
  -webkit-mask: url(./images/uncheck.svg) center / contain no-repeat;
}

.name {
  flex-grow: 2;
}

.size {
  align-content: flex-end;
}

`

module.exports = (state, prev, send) => {
  const checkbox = datasource => {
    const imgstyle = datasource.active ? style.checked : style.unchecked
    const el = html`<div class="${style.checkbox} ${imgstyle} clickable"></div>`
    el.onclick = (e) => {
      e.preventDefault()
      send('datasource_toggleactive', datasource)
    }
    return el
  }

  const entry = datasource => html`

  <div class="${style.entry}">
    ${checkbox(datasource)}
    <div class=${style.name}>${datasource.name}</div>
    <div class="${style.size}">${datasource.size}</div>
  </div>

  `

  const list = html`

  <div class="${style.list}">
    ${state.datasources.map(entry)}
  </div>

  `

  return list
}
