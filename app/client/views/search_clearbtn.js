module.exports = (state, emit) => {
  if (state.search.querystring) {
    const btn = html`<div id="search-clear-btn" class="${style.clear} clickable"></div>`

    btn.onclick = e => {
      e.preventDefault()
      emit('search:clear')
    }

    return btn
  } else {
    return null
  }
}
