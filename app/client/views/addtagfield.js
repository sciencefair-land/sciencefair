const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../constants')

const imgpath = require('../lib/imgpath')
const CacheComponent = require('cache-component')

const style = css`

.wrapper {
  position: relative;
  align-items: center;
}

.input {
  height: 30px;
  border: none;
  border-bottom: dotted 2px ${C.YELLOW};
  color: ${C.YELLOW};
  margin-left: 10px;
  padding-right: 30px;
  font-size: 90%;
  font-family: Aleo-Light;
  background: none;
  display: flex;
  outline: none;
}

.input::-webkit-input-placeholder {
   color: ${C.LIGHTGREY};
}

.cancel {
  padding: 5px;
  width: 20px;
  height: 20px;
  background-color: ${C.YELLOW};
  -webkit-mask: url(${imgpath('close.svg')}) center / contain no-repeat;
}

`

function CachedAddField () {
  if (!(this instanceof CachedAddField)) return new CachedAddField()
  CacheComponent.call(this)
}
CachedAddField.prototype = Object.create(CacheComponent.prototype)

CachedAddField.prototype._createProxy = function () {
  var proxy = document.createElement('div')
  this._brandNode(proxy)
  proxy.id = this._id
  proxy.isSameNode = el => el.id === 'cached-tag-add-field'
  return proxy
}

CachedAddField.prototype._render = function (state, emit) {
  const input = html`

  <input id="cached-tag-add-input" class="${style.input}" placeholder="new tag name..">

  `

  const submit = e => {
    e.preventDefault()
    emit('tags:add', { tag: e.target.value, papers: state.selection.list })
  }

  input.onkeypress = e => {
    if (!e) e = window.e
    var keyCode = e.keyCode || e.which
    if (keyCode === 13) submit(e)
  }

  const closebtn = html`<div class="${style.cancel} clickable"></div>`

  closebtn.onclick = e => {
    e.preventDefault()
    emit('tags:stop-add')
  }

  setTimeout(() => {
    input.focus()
  }, 200)

  return html`

  <div id="cached-tag-add-field" class="${style.wrapper}">
    ${input}${closebtn}
  </div>

  `
}

CachedAddField.prototype._update = function (state, emit) {
  return false
}

const inputel = CachedAddField()

module.exports = (state, emit) => {
  if (!(state.tags.showAddField)) return

  return inputel.render(state, emit)
}
