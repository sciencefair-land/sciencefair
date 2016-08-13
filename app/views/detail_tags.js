const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../lib/constants')

module.exports = (tags, state, prev, send) => {
  const style = css`

  .tags {
    justify-content: flex-end;
    justify-items: flex-end;
    align-items: flex-end;
    flex-wrap: wrap;
    position: absolute;
    right: 5px;
    bottom: 5px;
    max-width: 50%;
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
      const btn = html`<div class=${style.addtagbtn}>
        ${msg()}
        +
      </div>`

      btn.onclick = (e) => {
        e.preventDefault()
        send('tag_startadd')
      }

      return btn
    }
  }

  const tag = require('./detail_tag')

  function rendertags () {
    if (tags && tags.length > 0) {
      return tags.map((t) => tag(t, state, prev, send))
    } else {
      return null
    }
  }

  return html`

  <div class="${style.tags}">
    ${rendertags()}
    ${addTagButton(tags)}
    ${require('./addtagfield')(state, prev, send)}
  </div>

  `
}
