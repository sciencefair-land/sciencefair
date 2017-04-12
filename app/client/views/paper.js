const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../lib/constants')

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

.selected {
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 20px 20px 0;
  border-color: transparent ${C.YELLOW} transparent transparent;
  position: absolute;
  top: 0;
  right: 0;
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

CachedPaper.prototype._render = function (selected, progress) {
  const result = this._result
  const emit = this._emit

  const title = html`<div class="${style.title}"></div>`
  title.innerHTML = result.paper.title

  const paper = html`
    <div class="${style.paper} clickable">
      ${selectedmark(selected)}
      ${title}
      <div class="${style.author}">
        ${renderAuthor(result.paper.author)}
      </div>
      <div class="${style.year}">
        ${result.paper.date ? result.paper.date.year : 'none'}
      </div>
      <div class="${style.progressbar}" style="width: ${progress}%"/>
    </div>
  `

  const singleClick = e => emit('paper:select-show', {
    index: result.index,
    paper: result.paper,
    shift: e.shiftKey,
    ctrl: e.ctrlKey,
    meta: e.metaKey
  })

  const doubleClick = event => {
    if (result.paper.progress === 100) {
      emit('reader:read')
    } else {
      emit('downloads:add', [result.paper])
    }
  }

  paper.onclick = e => {
    e.preventDefault()
    singleClick(e)
  }

  paper.ondblclick = e => {
    e.preventDefault()
    doubleClick(e)
  }

  return paper
}

module.exports = (result, state, emit) => {
  const selected = state.selection.lookup[result.paper.key]
  const downloading = state.downloads.lookup[result.paper.key]
  const progress = downloading ? Math.max(downloading.progress, 10) : result.paper.progress

  let el = elementcache[result.paper.key]
  if (el) {
    return el.render(selected, progress)
  } else {
    const newel = CachedPaper(result, emit)
    elementcache[result.paper.key] = newel
    return newel.render(selected, progress)
  }
}

function renderAuthor (author) {
  const authors = isString(author)
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

function selectedmark (selected) {
  return selected ? html`<div class=${style.selected}></div>` : null
}
