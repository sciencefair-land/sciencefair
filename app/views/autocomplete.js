const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../lib/constants')
const fuzzy = require('fuzzy')

const style = css`

.autocomplete {
  position: absolute;
  top: 100%;
  left: 40px;
  width: 300px;
  flex-direction: column;
  background: ${C.DARKBLUE};
}

.tagrow {
  height: 40px;
  padding: 10px;
  justify-content: space-between;
  flex-direction: row;
  font-family: CooperHewitt-Medium;
  font-size: 1.2em;
  color: ${C.LIGHTGREY};
}

.match {
  font-weight: bold;
  color: ${C.YELLOW};
}

`

const matchopts = {
  pre: `<span class=${style.match}>`,
  post: '</span>'
}

module.exports = (state, prev, send) => {
  const tagquery = state.currentsearch.tagquery

  if (!tagquery || tagquery.length === 0) { return html`` }

  function tagmatchrow (tag) {
    const row = html`

    <div class="${style.tagrow} clickable">
      ${html('<div>#' + tag.string + '</div>')}
      <div>${state.tags.tags[tag.original].length}</div>
    </div>

    `

    row.onclick = (e) => {
      e.preventDefault()
      send('search_addtag', { tag: tag.original })
    }

    return row
  }

  function taghits () {
    const alltags = Object.keys(state.tags.tags)
    return fuzzy.filter(tagquery, alltags, matchopts)
  }

  return html`

  <div class="${style.autocomplete}">
    ${taghits().map((hit) => {
      return tagmatchrow(hit)
    })}
  </div>

  `
}
