const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../lib/constants')

module.exports = (license, state, prev, send) => {
  if (!license) return null

  const style = css`

  .tag {
    justify-content: flex-end;
    justify-items: flex-end;
    align-items: flex-end;
    position: absolute;
    right: 5px;
    top: 5px;
    max-width: 50%;
    border: 1px solid ${C.LIGHTGREY};
    padding: 5px;
    border-radius: 2px;
    color: ${C.LIGHTGREY};
    font-family: CooperHewitt-Medium;
    margin-left: 12px;
    margin-top: 30px;
    padding: 6px;
    padding-bottom: 1px;
  }

  `

  const licensediv = html`

  <div class="${style.tag}">
    ${license}
  </div>

  `

  return licensediv
}
