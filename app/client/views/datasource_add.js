const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../constants')

const CacheComponent = require('cache-component')

const style = css`

.container {
  width: 100%;
  height: 80px;
  flex-direction: column;
  padding: 20px;
}

.input {
  width: 100%;
  height: 30px;
  border: none;
  border-bottom: dotted 2px ${C.DARKBLUE};
  font-size: 130%;
  padding-bottom: 5px;
  font-family: CooperHewitt-Book;
  background: none;
  display: flex;
  outline: none;
}

`

function CachedDSField () {
  if (!(this instanceof CachedDSField)) return new CachedDSField()
  CacheComponent.call(this)
}
CachedDSField.prototype = Object.create(CacheComponent.prototype)

CachedDSField.prototype._createProxy = function () {
  var proxy = document.createElement('div')
  this._brandNode(proxy)
  proxy.id = this._id
  proxy.isSameNode = el => el.id === 'cached-ds-add-field'
  return proxy
}

CachedDSField.prototype._render = function (state, emit) {
  const input = html`

  <input type="text" id="cached-ds-add-input" class="${style.input}" placeholder="add a datasource key" />

  `

  input.onkeydown = e => {
    if (e.keyCode === 13) {
      setTimeout(() => {
        const value = input.value
        emit('datasources:add', { key: value.trim(), active: true })
        input.value = ''
      }, 300)
    }
  }

  const field = html`

  <div id="cached-ds-add-field" class="${style.container}">
    ${input}
  </div>

  `

  return field
}

CachedDSField.prototype._update = function (state, emit) {
  return false
}

const inputel = CachedDSField()

module.exports = (state, emit) => inputel.render(state, emit)
