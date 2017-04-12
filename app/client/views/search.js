const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../lib/constants')
const imgpath = require('../lib/imgpath')
const throttle = require('lodash/throttle')
const equal = require('lodash/isEqual')

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

const CacheComponent = require('cache-component')

function CachedSearch () {
  if (!(this instanceof CachedSearch)) return new CachedSearch()
  this._color = null
  CacheComponent.call(this)
}
CachedSearch.prototype = Object.create(CacheComponent.prototype)

CachedSearch.prototype._render = function (state, emit) {
  this._searchstate

  const emitify = throttle(emit, 200, { leading: true })
  const placeholder = getplaceholder(state)

  const clearing = state.search.clearing
  const querystring = state.search.querystring
  const query = state.search.query
  const tagquery = state.search.tagquery
  const tags = state.search.tags

  const hasquery = !!query
  const hastagquery = !!tagquery
  const hastags = tags.length > 0

  const input =

  const tagbadges = tags.length ? html`

  <div class="${style.tags}">
    ${tags.map(tag => require('./search_tag')(tag, emit))}
  </div>

  ` : null

  return html`

  <div class="${style.search}">
    <div class="${style.wrapper}">
      ${require('./search_input')(state, emit)}
      ${tagbadges}
      ${require('./search_clearbtn')(state, emit)}
      <img class="${style.img}" src="${imgpath('search.svg')}" />
      ${autocomplete()}
    </div>
  </div>

  `
}

// Override default shallow compare _update function
CachedSearch.prototype._update = function (state, emit) {
  return !equal(state.search, this._searchstate)
}

const searchel = CachedSearch()

module.exports = (state, emit) => searchel.render(state, emit)
