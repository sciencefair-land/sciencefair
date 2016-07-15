const html = require('choo/html')
const css = require('csjs-inject')

const paper = require('./paper')

module.exports = (state, prev, send) => {
  const style = css`

  .results {
    position: absolute;
    top: 150px;
    width: 100%;
    bottom: ${state.detailshown ? 200 : 50}px;
    padding: 0;
    margin: 50px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    overflow-y: scroll;
  }

  `

  return html`

  <div class="${style.results}">
    ${state.results.map((result, index) => {
      return paper({ index: index, paper: result }, state, prev, send)
    })}
  </div>

  `
}
