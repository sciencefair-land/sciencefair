const html = require('choo/html')
const css = require('csjs-inject')

const style = css`

.science {
  font-family: Aleo-Light;
  color: rgb(111, 174, 193);
  margin-right: -0.2em;
}

.fair {
  font-family: Aleo-Light;
  color: rgb(202, 172, 77);
}

`

module.exports = () => {
  return html`

  <span>
    <span class="${style.science}">science</span>
    <span class="${style.fair}">fair</span>
  </span>

  `
}
