const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../lib/constants')

module.exports = (tag, state, prev, send) => {
  const style = css`

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

  .deltagbtnWrapper {
    background: ${C.DARKBLUE};
    height: 16px;
    width: 16px;
    border-radius: 8px;
    position: absolute;
    top: 0;
    left: 0;
    margin-top: -8px;
    margin-left: -8px;
    display: none;
  }

  .deltagbtn {
    height: 16px;
    width: 16px;
    background-color: ${C.YELLOW};
    color: ${C.DARKBLUE};
    -webkit-mask: url(./images/delete2.svg) center / contain no-repeat;
  }

  .tag:hover > .deltagbtnWrapper {
    display: flex;
  }

  `

  const delbtn = html`

  <div class="${style.deltagbtnWrapper}">
    <div class="${style.deltagbtn}"></div>
  </div>

  `

  delbtn.onclick = (e) => {
    e.preventDefault()
    send('paper_removetag', { tag: tag, paper: state.selectedpaper })
  }

  const tagdiv = html`

  <div class="${style.tag} clickable">
    ${tag}
    ${delbtn}
  </div>

  `

  tagdiv.onclick = (e) => {
    e.preventDefault()
    send('search_addtag', { tag: tag })
  }

  return tagdiv
}
