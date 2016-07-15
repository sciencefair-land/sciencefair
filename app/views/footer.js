const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../constants')

const style = css`

.footer {
  position: absolute;
  height: 70px;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background: ${C.DARKBLUE};
  color: ${C.YELLOWFADE};
  font-family: CooperHewitt-Light;
  font-size: 130%;
}

.part {
  height: 100%;
  display: flex;
  align-items: center;
  margin: 0px 10px;
}

.left {
  width: 100px;
}

.mid {
  width: calc(100% - 200px);
  justify-content: center;
}

.right {
  width: 100px;
  justify-content: flex-end;
}

`

module.exports = (state, prev, send) => {
  return html`

  <div class="${style.footer}">
    <div class="${style.left} ${style.part}">0 MB/s</div>
    <div class="${style.mid} ${style.part}">No results</div>
    <div class="${style.right} ${style.part}">eLife</div>
    <div class=${style.part}>
      ${require('./toggledetail')(state, prev, send)}
    </div>
  </div>

  `
}
