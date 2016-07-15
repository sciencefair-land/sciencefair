const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../constants')

module.exports = (state, prev, send) => {
  const style = css`

  .tags {
    justify-content: flex-end;
    justify-items: flex-end;
    align-items: flex-end;
    flex-wrap: wrap;
    position: absolute;
    right: 5px;
    bottom: 5px;
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
    width: 29px;
  }

  `

  function addTagButton () {
    if (state.showAddField) {
      return ''
    } else {
      const btn = html`<div class=${style.addtagbtn}>+</div>`

      btn.onclick = () => {
        send('tag_startadd')
      }

      return btn
    }
  }

  const index = state.selectedpaper
  const paper = state.results[index]

  const tag = require('./detail_tag')

  return html`

  <div class="${style.row} ${style.tags}">
    ${paper.tags.map((t) => tag(t, state, prev, send))}
    ${addTagButton()}
    ${require('./addtagfield')(state, prev, send)}
  </div>

  `
}
