const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../constants')
const imgpath = require('../lib/imgpath')

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

module.exports = (state, emit) => html`

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
