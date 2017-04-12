const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../lib/constants')
const imgpath = require('../lib/imgpath')
const equal = require('lodash/isEqual')
const CacheComponent = require('cache-component')

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

.img {
  position: absolute;
  left: 2px;
  margin-top: 2px;
  margin-left: 2px;
  z-index: 900;
}

`

function CachedSearch () {
  if (!(this instanceof CachedSearch)) return new CachedSearch()
  CacheComponent.call(this)
}
CachedSearch.prototype = Object.create(CacheComponent.prototype)

CachedSearch.prototype._render = function (state, emit) {
  this._searchstate = state

  return html`

  <div class="${style.search}">
    <div class="${style.wrapper}">
      <img class="${style.img}" src="${imgpath('search.svg')}" />
      ${require('./search_input')(state, emit)}
      ${require('./search_tags')(state, emit)}
      ${require('./search_clearbtn')(state, emit)}
      ${require('./autocomplete')(state, emit)}
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
