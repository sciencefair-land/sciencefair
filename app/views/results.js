const html = require('choo/html')
const css = require('csjs-inject')

const paper = require('./paper')

module.exports = (state, prev, send) => {
  const style = css`

  .results {
    position: absolute;
    top: 100px;
    bottom: ${state.detailshown ? 250 : 70}px;
    right: 20px;
    left: 20px;
    padding: 0;
    margin: 50px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-items: flex-start;
    align-content: flex-start;
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
