const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../constants')

const style = css`

.tags {
  justify-content: flex-end;
  justify-items: flex-end;
  align-items: flex-end;
  flex-wrap: wrap;
  position: absolute;
  right: 5px;
  bottom: 5px;
  max-height: 50%;
  overflow-y: scroll;
}

.tag {
  border: 1px solid ${C.YELLOW};
  padding: 5px;
  border-radius: 2px;
  color: ${C.YELLOW};
  font-family: Aleo-Light;
  margin-left: 12px;
  margin-top: 12px;
  justify-content: center;
  align-content: center;
  position: relative;
}

.addtagbtn extends .tag {
  height: 29px;
  padding: 5px 8px;
  justify-content: center;
  align-content: center;
}

`

module.exports = (tags, state, emit) => {
  function msg () {
    if (!tags || tags.length === 0) {
      return 'no tags yet'
    } else {
      return null
    }
  }

  function addTagButton () {
    if (state.showAddField) {
      return ''
    } else {
      const btn = html`<div class="${style.addtagbtn} clickable">
        ${msg()}
        +
      </div>`

      btn.onclick = (e) => {
        e.preventDefault()
        emit('tags:start-add')
      }

      return btn
    }
  }

  const tag = require('./detail_tag')

  function rendertags () {
    if (tags && tags.length > 0) {
      return tags.map(
        t => tag(t, state, emit))
    } else {
      return null
    }
  }

  return html`

  <div class="${style.tags}">
    ${rendertags()}
    ${addTagButton(tags)}
    ${require('./addtagfield')(state, emit)}
  </div>

  `
}
