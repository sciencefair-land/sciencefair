const html = require('choo/html')
const css = require('csjs-inject')

const tagview = require('./search_tag')

const style = css`

.tags {
  position: absolute;
  right: 34px;
}

`

module.exports = (state, emit) => {
  const tags = state.search.tags
  if (!tags || tags.length === 0) return null

  const tagsel = html`

  <div class="${style.tags}">
    ${tags.map(tag => tagview(tag, emit))}
  </div>

  `

  return tagsel
}
