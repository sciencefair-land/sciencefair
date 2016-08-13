const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../lib/constants')

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
    width: 29px;
  }

  `

  function addTagButton () {
    if (state.showAddField) {
      return ''
    } else {
      const btn = html`<div class=${style.addtagbtn}>+</div>`

      btn.onclick = (e) => {
        e.preventDefault()
        send('tag_startadd')
      }

      return btn
    }
  }

  const id = state.selection.papers[0]
  const paper = state.results.find((result) => {
    return result.document.identifier[0].id === id
  })
  const doc = paper.document

  const tag = require('./detail_tag')

  return html`

  <div class="${style.tags}">
    ${doc.tags.map((t) => tag(t, state, prev, send))}
    ${addTagButton()}
    ${require('./addtagfield')(state, prev, send)}
  </div>

  `
}
