const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../constants')

const throttle = require('lodash/throttle')
const equal = require('lodash/isEqual')
const clone = require('lodash/cloneDeep')
const CacheComponent = require('cache-component')

const debug = require('debug')('sciencefair:view:searchinput')

const style = css`

.input {
  width: 100%;
  height: 30px;
  border: none;
  border-bottom: dotted 2px ${C.DARKBLUE};
  font-size: 130%;
  padding-left: 40px;
  padding-bottom: 5px;
  font-family: CooperHewitt-Book;
  background: none;
  display: flex;
  outline: none;
}

.img {
  position: absolute;
  left: 2px;
  margin-top: 2px;
  margin-left: 2px;
  z-index: 900;
}

.tags {
  position: absolute;
  right: 34px;
}

`

const placeholders = [
  'type a keyword to search',
  'type \'* keyword\' to search your local collection',
  'type # to access tagged papers, or \'* keyword\' to search local collection'
]

const getplaceholder = state => {
  if (state.search.tags.length > 0) return ''
  const sometags = Object.keys(state.tags.tags).length > 1
  const somecollection = state.collectioncount > 0
  const placeidx = somecollection + sometags
  return placeholders[placeidx]
}

const getinputvalue = state => {
  const clearing = state.search.clearing
  const querystring = state.search.querystring
  if (clearing) {
    return null
  } else {
    return (' ' + querystring).slice(1)
  }
}

const tagquery = str => { return /#/.test(str) }

function CachedInput () {
  if (!(this instanceof CachedInput)) return new CachedInput()
  CacheComponent.call(this)
}
CachedInput.prototype = Object.create(CacheComponent.prototype)

CachedInput.prototype._createProxy = function () {
  var proxy = document.createElement('div')
  this._brandNode(proxy)
  proxy.id = this._id
  proxy.isSameNode = el => el.id === 'cached-search-input'
  return proxy
}

CachedInput.prototype._render = function (state, emit) {
  this._searchtags = clone(state.search.tags)

  const emitify = throttle(emit, 200, { leading: true })

  const inputvalue = getinputvalue(state)
  const placeholder = getplaceholder(state)

  const input = html`

  <input
    class="${style.input}"
    id="cached-search-input"
    placeholder="${placeholder}"
    value="${inputvalue}"
    autofocus
  >

  `

  input.onsubmit = e => {
    // don't clear the input field
    e.preventDefault()
  }

  input.onkeyup = e => {
    const key = e.key
    debug('onkeydown', key, e)

    if (key === 'Backspace' && e.target.value.trim() === '') return emit('search:clear')

    if (key === '#' || tagquery(e.target.value)) {
      // searching for a tag, submit immeditely to activate tag list
      const querystring = e.target.value.trim().length > 0
        ? e.target.value + ''
        : '#'
      emitify.cancel()
      emit('search:set-query-string', querystring)
      return
    }

    if (key === ' ' || key === 'Enter') {
      // space or enter submits the search immediately
      emitify.cancel()
      const querystring = e.target.value + (key === 'enter' ? ' ' : '')
      emit('search:set-query-string', querystring)
      return
    }

    // any other key starts a timer to submit a search
    // if there's an existing timer (from a previous keypress)
    // it gets cancelled - this reduces the number of searches
    // that get submitted while a user is still typing the query
    if (e.target.value.length > 3 || /^#/.test(e.target.value)) {
      emitify.cancel()
      emitify('search:set-query-string', e.target.value)
    }
  }

  return input
}

// Override default shallow compare _update function
CachedInput.prototype._update = function (state, emit) {
  if (state.search.clearing) {
    this._element.value = ''
    emit('search:done-clearing')
    return false
  } else if (!equal(state.search.tags, this._searchtags) || this._element.value === '') {
    this._element.placeholder = getplaceholder(state)
    this._element.value = state.search.querystring
    this._searchtags = state.search.tags
    debug('updated value and tags', this._element.value, this._searchtags)
    return false
  }

  return false
}

const inputel = CachedInput()

module.exports = (state, emit) => inputel.render(state, emit)
