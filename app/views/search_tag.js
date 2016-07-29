const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../constants')

module.exports = (tag, state, prev, send) => {
  const style = css`

  .tag {
    border: 1px solid ${C.WHITE};
    padding: 5px;
    border-radius: 2px;
    color: ${C.WHITE};
    font-family: Aleo-Light;
    margin-right: 12px;
    justify-content: center;
    align-content: center;
    position: relative;
  }

  .deltagbtnWrapper {
    background: ${C.BLUE};
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
    background-color: ${C.WHITE};
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
    e.stopPropagation()
    send('search_removetag', { tag: tag } )
  }

  const tagdiv = html`

  <div class="${style.tag} clickable">
    ${tag}
    ${delbtn}
  </div>

  `

  return tagdiv
}
