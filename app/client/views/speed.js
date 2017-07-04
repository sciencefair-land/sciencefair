const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../constants')
const bytes = require('bytes')
const icon = require('./icon')

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

.icon {
  justify-content: center;
  align-items: center;
  margin-left: 10px;
  margin-right: 10px;
}

.zero {
  opacity: 0.8;
}

`

const byteopts = { decimalPlaces: 0 }
const transfericon = {
  name: 'xfer',
  backgroundColor: C.YELLOWFADE,
  width: 20,
  height: 20
}

module.exports = data => {
  const down = bytes(data.down, byteopts)
  const up = bytes(data.up, byteopts)
  const zero = data.down === 0 && data.up === 0
  const opacity = zero ? style.zero : ''

  const top = zero ? html`<div class="${style.rate}">0</div>` : html`

  <div class="${style.rate}">
    <div class="${style.ratepart} ${style.down}">${down}/s</div>
    <div class="${style.icon}">${icon(transfericon)}</div>
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
