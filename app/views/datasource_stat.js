const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../lib/constants')

const style = css`

.tick {
  width: 30px;
  height: 30px;
  background-color: ${C.MIDBLUEFADE};
  -webkit-mask: url(./images/tick.svg) center / contain no-repeat;
}

.cross {
  width: 30px;
  height: 30px;
  background-color: ${C.MIDBLUEFADE};
  -webkit-mask: url(./images/cross.svg) center / contain no-repeat;
}

.badge {
  border: 1px solid ${C.WHITE};
  border-radius: 2px;
  color: ${C.WHITE};
  font-family: Aleo-Light;
  margin-right: 12px;
  justify-content: center;
  align-content: center;
  position: relative;
  height: 30px;
}

.name {
  border-right: 1px solid ${C.WHITE};
  align-items: center;
  justify-content: center;
  padding: 5px;
}

.value {
  width: 30px;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

`

const tickcross = bool => {
  return html`<div class="${bool ? style.tick : style.cross}" />`
}

module.exports = (name, value) => {
  const statbadge = html`

  <div class="${style.badge}">
    <div class="${style.name}">${name}</div>
    <div class="${style.value}">${(typeof value === 'boolean') ? tickcross(value) : value}</div>
  </div>

  `

  return statbadge
}
