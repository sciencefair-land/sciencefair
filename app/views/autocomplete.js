const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../lib/constants')
const fuzzy = require('fuzzy')
const sortBy = require('lodash/sortBy')

const style = css`

.autocomplete {
  position: absolute;
  top: 100%;
  left: 40px;
  width: 300px;
  max-height: 60vw;
  overflow-y: scroll;
  flex-direction: column;
  background: ${C.DARKBLUE};
  z-index: 1001;
}

.tagrow {
  position: relative;
  height: 40px;
  padding: 10px;
  justify-content: space-between;
  flex-direction: row;
  font-family: CooperHewitt-Light;
  font-size: 1.2em;
  color: ${C.LIGHTGREY};
}

.match {
  font-weight: bold;
  color: ${C.YELLOW};
}

.more {
  color: ${C.LIGHTGREY};
  font-style: italic;
  opacity: 0.5;
}

`

const matchopts = {
  pre: `<span class=${style.match}>`,
  post: '</span>'
}

module.exports = (state, prev, send) => {
  const tagquery = state.currentsearch.tagquery

  if (!((typeof tagquery) === 'string')) return html``

  function tagcount (tag) {
    return {
      string: tag.string,
      original: tag.original,
      count: state.tags.tags[tag.original].length
    }
  }

  function taghits () {
    const alltags = Object.keys(state.tags.tags).filter(t => t !== '__local')
    if (tagquery.length === 0) {
      return alltags.map((tag) => {
        return {
          string: tag,
          original: tag
        }
      })
    } else {
      return fuzzy.filter(tagquery, alltags, matchopts)
    }
  }

  function row (tag) {
    const row = html`

    <div class="${style.tagrow} clickable">
      ${html(`<div>${tag.string}</div>`)}
      <div>${tag.count}</div>
    </div>

    `

    row.onclick = (e) => {
      e.preventDefault()
      send('search_addtag', { tag: tag.original })
    }

    return row
  }

  function rows () {
    const hits = taghits().map(tagcount)

    const sorted = sortBy(hits, (tag) => {
      return 0 - tag.count
    })

    const fullrows = sorted.map((hit) => {
      return row(hit)
    }).slice(0, C.AUTOMAXTAGS)

    if (sorted.length > C.AUTOMAXTAGS) {
      const diff = sorted.length - C.AUTOMAXTAGS
      const more = html`
      <div class="${style.tagrow}">
        <div class="${style.more}">... and ${diff} more tags</div>
      </div>
      `
      fullrows.push(more)
    }

    return fullrows
  }

  return html`

  <div class="${style.autocomplete}">
    ${rows()}
  </div>

  `
}
