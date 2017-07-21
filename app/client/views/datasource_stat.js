const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../constants')

module.exports = (name, value) => {
  const style = css`

  .badge {
    border: 1px solid ${C.WHITE};
    border-radius: 2px;
    color: ${C.WHITE};
    font-size: 0.8em;
    font-family: Aleo-Light;
    margin-right: 12px;
    justify-content: center;
    align-content: center;
    position: relative;
    height: 24px;
  }

  .name {
    align-items: center;
    justify-content: center;
    padding: 5px;
  }

  .value {
    border-left: 1px solid ${C.WHITE};
    min-width: 20px;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    padding: ${(typeof value === 'boolean') ? 0 : '0 5px'};
  }

  `

  const statbadge = html`

  <div class="${style.badge}">
    <div class="${style.name}">${name}</div>
    ${
      (typeof value === 'boolean') || !value
      ? null
      : html`<div class="${style.value}">${value}</div>`
    }
  </div>

  `

  return statbadge
}
