const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../constants')
const highlight = require('../lib/highlight')

const isString = require('lodash/isString')

const width = 160

const shared = css`

.base {
  position: absolute;
  font-family: Aleo-Regular;
  text-align: left;
  font-size: 14px;
}

`

const style = css`

.paper {
  position: relative;
  width: ${width}px;
  height: ${width * 1.31}px;
  display: flex;
  flex-direction: row;
  justify-items: flex-start;
  align-items: flex-start;
  background: ${C.DARKBLUE};
  margin: 10px;
  color: ${C.LIGHTGREY};
}

.title extends ${shared.base} {
  display: block;
  left: 10px;
  right: 10px;
  top: 10px;
  bottom: 50px;
  overflow-y: scroll;
  overflow-x: hidden;
}

.author extends ${shared.base} {
  font-size: 10px;
  left: 10px;
  right: 44px;
  bottom: 10px;
  font-family: CooperHewitt-MediumItalic;
  flex-wrap: wrap;
}

.author > span {
  padding: 0;
  margin-right: 3px;
}

.year extends ${shared.base} {
  left: 120px;
  right: 10px;
  bottom: 10px;
  justify-content: flex-end;
  font-family: CooperHewitt-Medium;
}

.corner {
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 20px 20px 0;
  position: absolute;
  top: 0;
  right: 0;
}

.selected {
  border-color: transparent ${C.YELLOW} transparent transparent;
}

.unselected {
  border-color: transparent;
}

.progressbar {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 8px;
  width: 0;
  background-color: ${C.YELLOW};
}

`

const elementcache = {}

const CacheComponent = require('cache-component')

function CachedPaper (result, emit) {
  if (!(this instanceof CachedPaper)) return new CachedPaper(result, emit)
  this._result = result
  this._emit = emit
  CacheComponent.call(this)
}
CachedPaper.prototype = Object.create(CacheComponent.prototype)

CachedPaper.prototype._render = function () {
  const result = this._result
  const emit = this._emit
  const query = this._query

  this._watch(result.paper)

  const bar = this._bar = html`

  <div
    class="${style.progressbar}"
    style="${barstyle(result.paper.minprogress())}"
  />

  `

  const title = html`<div class="${style.title}"></div>`
  title.innerHTML = result.paper.title
  highlight(title, query)

  const author = renderAuthor(result.paper.author)
  highlight(author, query)

  const corner = this._corner =
    html`<div class="${cornerclass(result.paper.selected)}"></div>`

  const paper = html`
    <div class="${style.paper} clickable">
      ${corner}
      ${title}
      <div class="${style.author}">
        ${author}
      </div>
      <div class="${style.year}">
        ${result.paper.date ? result.paper.date.year : 'none'}
      </div>
      ${bar}
    </div>
  `

  const singleClick = e => emit('paper:select-show', {
    index: result.index,
    paper: result.paper,
    shift: e.shiftKey,
    ctrl: e.ctrlKey,
    meta: e.metaKey
  })

  const doubleClick = () => {
    if (result.paper.progress === 100) {
      emit('reader:read', result.paper)
    } else {
      emit('downloads:add', [result.paper])
    }
  }

  let timer

  paper.onclick = e => {
    if (timer) {
      clearTimeout(timer)
      return doubleClick()
    }
    timer = setTimeout(() => {
      singleClick(e)
      timer = null
    }, 250)
  }

  paper.setAttribute('id', 'paper-' + result.paper.key)

  return paper
}

CachedPaper.prototype._watch = function (paper) {
  paper.on('selected', () => this.updateSelected(true))
  paper.on('deselected', () => this.updateSelected(false))
  paper.on('downloading', () => this.updateProgress(paper.minprogress()))
  paper.on('progress', () => this.updateProgress(paper.minprogress()))
}

CachedPaper.prototype.updateSelected = function (selected) {
  this._corner.className = cornerclass(selected)
}

CachedPaper.prototype.updateProgress = function (progress) {
  this._bar.style = barstyle(progress)
}

CachedPaper.prototype._update = function () {
  return false
}

module.exports = (result, state, emit) => {
  let el = elementcache[result.paper.key]
  if (el) {
    el._query = state.search.query
    return el.render()
  } else {
    const newel = CachedPaper(result, emit)
    elementcache[result.paper.key] = newel
    newel._query = state.search.query
    return newel.render()
  }
}

function renderAuthor (author) {
  if (!author || author.length === 0) return html`<span>Anon</span>`

  let authors = isString(author)
    ? author.split(/,\s?/)
    : author.map(a => a.surname)

  if (authors.length === 1) {
    return html`<span>${authors[0]}`
  } else if (authors.length < 4) {
    return html`
      <span>
        ${authors.slice(0, -1).join(', ') + ' and ' + authors.slice(-1)[0]}
      </span>
    `
  } else {
    return html`<span>${authors[0]} et al.</span>`
  }
}

function cornerclass (selected) {
  return style.corner + ' ' + (selected ? style.selected : style.unselected)
}

function barstyle (progress) {
  return `width: ${progress}%;`
}
