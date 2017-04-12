const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../lib/constants')
const imgpath = require('../lib/imgpath')


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

module.exports = (state, emit) => {
  const emitify = throttle(emit, 200, { leading: true })

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
      // space or enter submits the search immediately
      const querystring = e.target.value + (e.keyCode === 32 ? ' ' : '')
      emit('search:set-query-string', querystring)
    } else {
      // any other key starts a timer to submit a search
      // if there's an existing timer (from a previous keypress)
      // it gets cancelled - this reduces the number of searches
      // that get submitted while a user is still typing the query
      emitify.cancel()
      const querystring = e.target.value
      if (querystring.length > 3) emitify('search:set-query-string', e.target.value)
    }
  }

  return input
}
