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
  -webkit-app-region: drag;
  -webkit-user-select: none;
  -webkit-app-region: drag;
}

.science {
  color: rgb(111, 174, 193);
}

.fair {
  color: rgb(202, 172, 77);
}
`

module.exports = () => html`
  <div class="${style.titlebar}">
    <span class="${style.science}">science</span>
    <span class="${style.fair}">fair</span>
  </div>
`
