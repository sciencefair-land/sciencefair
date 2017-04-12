const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../lib/constants')
const imgpath = require('../lib/imgpath')
const throttle = require('lodash/throttle')
const equal = require('lodash/isEqual')
const clone = require('lodash/cloneDeep')
const CacheComponent = require('cache-component')

const debug = require('debug')('sciencefair:view:search')

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

function CachedInput () {
  if (!(this instanceof CachedInput)) return new CachedInput()
  CacheComponent.call(this)
}
CachedInput.prototype = Object.create(CacheComponent.prototype)

CachedInput.prototype._render = function (state, emit) {
  if (this._element) return this._element
  this._searchtags = clone(state.search.tags)

  const emitify = throttle(emit, 500, { leading: false })

  const inputvalue = getinputvalue(state)
  const placeholder = getplaceholder(state)

  const input = html`

  <input
    class="${style.input}"
    placeholder="${placeholder}"
    value="${inputvalue}"
    autofocus
  >

  `

  input.onsubmit = e => {
    // don't clear the input field
    e.preventDefault()
  }

  input.onkeydown = e => {
    if (e.keyCode == 32 || e.keyCode === 13) {
      emitify.cancel()
      // space or enter submits the search immediately
      const querystring = e.target.value + (e.keyCode === 32 ? ' ' : '')
      emit('search:set-query-string', querystring)
    } else {
      // any other key starts a timer to submit a search
      // if there's an existing timer (from a previous keypress)
      // it gets cancelled - this reduces the number of searches
      // that get submitted while a user is still typing the query
      const querystring = e.target.value
      if (querystring.length > 3) {
        emitify.cancel()
        emitify('search:set-query-string', e.target.value)
      }
    }
  }

  this._input = input

  return input
}

// Override default shallow compare _update function
CachedInput.prototype._update = function (state, emit) {
  if (state.search.clearing) {
    this._input.value = ''
    emit('search:done-clearing')
  }
  if (!equal(state.search.tags, this._searchtags)) {
    this._input.value = state.search.querystring
  }
  return false
}

const inputel = CachedInput()

module.exports = (state, emit) => inputel.render(state, emit)
