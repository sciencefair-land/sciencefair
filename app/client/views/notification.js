const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../lib/constants')

const style = css`

.container {
  position: fixed;
  top: 40px;
  right: 40px;
  flex-direction: column;
  z-index: 2000;
}

.msgbox {
  position: relative;
  height: auto;
  width: 400px;
  padding: 0 20px;
  font-family: CooperHewitt-Light;
  background: ${C.DARKBLUE};
  color: ${C.LIGHTGREY};
  border-radius: 6px;
  opacity: 0.9;
  margin-bottom: 30px;
  flex-direction: column;
}

.title {
  margin-bottom: 0;
  font-family: CooperHewitt-Bold;
}

`

module.exports = (state, emit) => {
  const notify = noteId => {
    const note = state.notifications[noteId]

    const el = html`

    <div class="${style.msgbox}">
      <h3 class="${style.title}">${note.title || 'Notification'}</h3>
      <p class="${style.message}">${note.message || ''}</p>
    </div>

    `

    el.onclick = e => {
      e.preventDefault()
      e.stopPropagation()
      emit('notification:remove', noteId)
    }

    return el
  }

  return html`

  <div class="${style.container}">
    ${Object.keys(state.notifications).map(notify)}
  </div>

  `
}
