const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../lib/constants')

const overlay = require('./overlay')

const style = css`

.content {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  flex-direction: column;
}

`

module.exports = (state, emit) => {
  if (!state.datasources.shown) return null

  const checklist = require('./datasource_checklist')(state, emit)
  const addfield = require('./datasource_add')(state, emit)

  const datasources = html`

  <div class="${style.content}">
    ${checklist}
    ${addfield}
  </div>

  `

  datasources.onclick = e => {
    // don't trigger toggle when user clicks on the popup
    e.preventDefault()
    e.stopPropagation()
  }

  const onclick = e => {
    // trigger toggle when user clicks on the overlay
    e.preventDefault()
    emit('datasources:toggle-shown')
  }

  return overlay(state, emit, {
    title: 'Datasources',
    content: datasources,
    onclick: onclick
  })
}
