const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../lib/constants')

const licenseurls = {
  'http://creativecommons.org/licenses/by/4.0/': 'CC-BY 4.0',
  'http://creativecommons.org/licenses/by/3.0/': 'CC-BY 3.0',
  'http://creativecommons.org/licenses/by/2.0/': 'CC-BY 2.0',
  'http://creativecommons.org/licenses/by/1.0/': 'CC-BY 1.0'
}

module.exports = (license, state, emit) => {
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

  function niceLicense () {
    if (/^http/.test(license)) {
      const resolved = licenseurls[license]
      return resolved || license
    }
    return license
  }

  const licensediv = html`

  <div class="${style.tag}">
    ${niceLicense()}
  </div>

  `

  return licensediv
}
