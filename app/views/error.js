const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../lib/constants')

const style = css`

.container {
  position: absolute;
  top: 40px;
  right: 40px;
  flex-direction: column;
  z-index: 2000;
}

.error {
  position: relative;
  height: auto;
  width: 400px;
  padding: 0 20px;
  background: ${C.LIGHTGREY};
  border: 3px solid ${C.ERROR};
  margin-bottom: 30px;
  flex-direction: column;
}

.title {
  margin-bottom: 0;
}

`

module.exports = (state, prev, send) => {
  if (state.errors.length === 0) return null

  const error = errorId => {
    const err = state.errors[errorId]

    const el = html`

    <div class="${style.error}">
      <h3 class="${style.title}">Error</h3>
      <p class="${style.message}">${err.message}</p>
    </div>

    `

    el.onclick = e => {
      e.preventDefault()
      e.stopPropagation()
      send('error_remove', errorId)
    }

    return el
  }

  return html`

  <div class="${style.container}">
    ${Object.keys(state.errors).map(error)}
  </div>

  `
}
