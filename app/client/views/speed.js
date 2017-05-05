const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../lib/constants')
const bytes = require('bytes')

const style = css`

.speed {
  flex-direction: column;
  width: 100%;
  align-items: center;
}

.rate {
  font-size: 1.3em;
  flex-direction: row;
  flex-wrap: nowrap;
}

.ratepart {
  width: 110px;
}

.down {
  justify-content: flex-end;
}

.up {
  justify-content: flex-start;
}

.arrows {
  justify-content: center;
  align-items: center;
  font-family: monospace;
  width: 40px;
}

.zero {
  opacity: 0.8;
}

`

const byteopts = { decimalPlaces: 0 }

module.exports = data => {
  const down = bytes(data.down, byteopts)
  const up = bytes(data.up, byteopts)
  const zero = data.down === 0 && data.up === 0
  const opacity = zero ? style.zero : ''

  const top = zero ? html`<div class="${style.rate}">0</div>` : html`

  <div class="${style.rate}">
    <div class="${style.ratepart} ${style.down}">${down}/s</div>
    <div class="${style.arrows}">⥯</div>
    <div class="${style.ratepart} ${style.up}">${up}/s</div>
  </div>

  `

  return html`

  <div class="${style.speed} ${opacity}">
    ${top}
    <div>speed</div>
  </div>

  `
}
