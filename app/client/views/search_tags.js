module.exports = (state, emit) => {
  if (!state.search.tags) return null

  return html`

  <div class="${style.tags}">
    ${state.search.tags.map(tag => require('./search_tag')(tag, emit))}
  </div>

  `
}
