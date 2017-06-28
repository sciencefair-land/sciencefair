const html = require('choo/html')
const css = require('csjs-inject')

const style = css`

.fullwindow {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

`

module.exports = (state, emit) => html`

<body>
  <div class="${style.fullwindow}">
    ${require('./spinkit_cubegrid')}
  </div>
</body>

`
