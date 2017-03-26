const html = require('choo/html')
const css = require('csjs-inject')

const style = css`
.titlebar {
  position: absolute;
  top: 2px;
  right: 10px;
  width: 160px;
  font-family: Aleo-Light;
  justify-content: flex-end;
  font-size: 130%;
  opacity: 0.7;
}

.science {
  color: rgb(111, 174, 193);
}

.fair {
  color: rgb(202, 172, 77);
}
`

module.exports = (state, prev, send) => {
  return html`
    <div class="${style.titlebar}">
      <span class="${style.science}">science</span>
      <span class="${style.fair}">fair</span>
    </div>
  `
}
