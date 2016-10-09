const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../lib/constants')
const numeral = require('numeral')

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
  align-content: center;
  justify-content: space-between;
  font-family: CooperHewitt-Light;
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
  background-color: ${C.MIDBLUEFADE};
  -webkit-mask: url(./images/uncheck.svg) center / contain no-repeat;
}

.name {
  flex-grow: 2;
  padding-top: 3px;
}

.size {
  align-content: flex-end;
  padding-top: 3px;
}

.loading {
  flex-grow: 2;
  font-family: CooperHewitt-LightItalic;
  padding-top: 3px;
}

.shimmy {
  margin-left: 1px;
}

.shortkey {
  font-family: CooperHewitt-MediumItalic;
  padding: 0 10px;
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

  const entry = datasource => {
    if (datasource.loading) {
      const shortkey = html`

      <span class="${style.shortkey}">${datasource.key.slice(0, 6)}...</span>

      `

      return html`

      <div class="${style.entry}">
        <div class="spinner ${style.checkbox} ${style.shimmy}">
          <div class="double-bounce1"></div>
          <div class="double-bounce2"></div>
        </div>
        <div class=${style.loading}>loading datasource ${shortkey} from p2p network</div>
      </div>

      `
    } else {
      return html`

      <div class="${style.entry}">
        ${checkbox(datasource)}
        <div class=${style.name}>${datasource.name}</div>
        <div class="${style.size}">${numeral(datasource.size).format('0.0a')} papers</div>
      </div>

      `
    }
  }

  const list = html`

  <div class="${style.list}">
    ${state.datasources.map(entry)}
  </div>

  `

  return list
}
