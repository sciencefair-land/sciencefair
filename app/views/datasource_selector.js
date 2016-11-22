const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../lib/constants')

const style = css`

.overlay {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.datasources {
  width: 50%;
  min-width: 600px;
  max-height: 50%;
  background: ${C.BLUE};
  display: flex;
  flex-direction: column;
  align-items: flex-start;

}

.header {
  width: 100%;
  padding: 30px;
  background: ${C.MIDBLUE};
  color: ${C.LIGHTGREY};
  margin: 0;
  align-items: center;
  font-family: Aleo-Regular;
}

`

module.exports = (state, prev, send) => {
  if (!state.datasources.shown) return null

  const checklist = require('./datasource_checklist')(state, prev, send)

  const addfield = require('./datasource_add')(state, prev, send)

  const datasources = html`

  <div class="${style.datasources}">
    <h1 class="${style.header}">Datasources</h1>
    ${checklist}
    ${addfield}
  </div>

  `

  datasources.onclick = e => {
    // don't trigger toggle when user clicks on the popup
    e.preventDefault()
    e.stopPropagation()
  }

  const overlay = html`

  <div class="${style.overlay}">
    ${datasources}
  </div>

  `

  overlay.onclick = e => {
    // trigger toggle when user clicks on the overlay
    e.preventDefault()
    send('datasource_selector_toggle')
  }

  return overlay
}
