const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../lib/constants')
const imgpath = require('../lib/imgpath')
const throttle = require('lodash/throttle')

const debug = require('debug')('sciencefair:view:search')

const style = css`

.search {
  height: 30px;
  width: 80%;
  bottom: 0;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: row;
  background: ${C.BLUE};
  position: relative;
}

.wrapper {
  position: relative;
  margin: 50px;
  width: 100%;
  height: 50px;
  display: flex;
}

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

.clear {
  position: absolute;
  padding: 5px;
  right: 8px;
  top: 0;
  width: 20px;
  height: 30px;
  background-color: ${C.DARKBLUE};
  -webkit-mask: url(${imgpath('close.svg')}) center / contain no-repeat;
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

const getinputvalue = (clearing, querystring) => {
  if (clearing) {
    return null
  } else {
    return (' ' + querystring).slice(1)
  }
}

module.exports = (state, emit) => {
  const emitify = throttle(emit, 50, { leading: true })
  const placeholder = getplaceholder(state)

  const clearing = state.search.clearing
  const querystring = state.search.querystring
  const query = state.search.query
  const tagquery = state.search.tagquery
  const tags = state.search.tags

  const hasquery = !!query
  const hastagquery = !!tagquery
  const hastags = tags.length > 0

  const inputvalue = getinputvalue(clearing, querystring)
  console.log(`SEARCH INPUT '${inputvalue}'`)

  const input = html`

  <input
    class="${style.input}"
    placeholder="${placeholder}"
    value="${inputvalue}"
    autofocus
  >

  `

  input.onsubmit = e => {
    e.preventDefault()
  }

  input.onkeydown = e => {
    if (e.keyCode == 32 || e.keyCode === 13) {
      emitify(
        'search:set-query-string',
        e.target.value + (e.keyCode === 32 ? ' ' : '')
      )
    }
  }

  const tagbadges = tags.length ? html`

  <div class="${style.tags}">
    ${tags.map(tag => require('./search_tag')(tag, emit))}
  </div>

  ` : null

  const clearbtn = () => {
    if (inputvalue) {
      const btn = html`<div class="${style.clear} clickable"></div>`

      btn.onclick = e => {
        e.preventDefault()
        emitify('search:clear')
      }

      return btn
    } else {
      return null
    }
  }

  const autocomplete = () => {
    if (hastagquery) {
      return require('./autocomplete')(state, emit)
    } else {
      return null
    }
  }

  return html`

  <div class="${style.search}">
    <div class="${style.wrapper}">
      ${input}
      ${tagbadges}
      ${clearbtn()}
      <img class="${style.img}" src="${imgpath('search.svg')}" />
      ${autocomplete()}
    </div>
  </div>

  `
}
