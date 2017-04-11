const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../lib/constants')

module.exports = (state, emit) => {
  const style = css`

  .message {
    position: absolute;
    bottom: 300px;
    left: 50px;
    font-size: 5em;
    font-family: Aleo-Light;
    color: ${C.MIDBLUE};
    pointer-events: none;
  }

  `

  var msg = ''
  if (state.initialising) {
    msg = 'Syncing initial data.'
  } else if (state.results && state.results.length === 0) {
    const query = state.search.query
    const hasquery = query && query.length > 0
    const tags = state.search.tags
    const hastags = tags && tags.length > 0
    if (hasquery || hastags) {
      msg = 'No results.'
    } else {
      msg = 'Search for a paper.'
    }
  }

  return html`

  <div class="${style.message}">
    ${msg}
  </div>

  `
}
