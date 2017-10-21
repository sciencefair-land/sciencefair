const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../constants')

const isString = require('lodash/isString')
const intersection = require('lodash/intersection')
const open = require('electron').shell.openExternal

const height = 200
const padding = 5

module.exports = (state, emit) => {
  const style = css`

  .detail {
    position: absolute;
    bottom: 70px;
    height: ${state.detailshown ? height : 0}px;
    width: 100%;
    padding: ${state.detailshown ? padding : 0}px;
    margin: 0;
    flex-direction: row;
    overflow-y: hidden;
    background: ${C.GREYBLUE};
    font-family: Aleo-Regular;
    font-size: 16px;
    color: ${C.LIGHTGREY};
  }

  .column {
    width: 50%;
    max-width: 50%;
    overflow: hidden;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
  }

  .paper {
    width: 70%;
    overflow: auto;
    flex-direction: column;
    justify-content: space-between;
    padding: 10px;
    user-select: text;
  }

  .row {
    flex-direction: row;
    justify-content: space-between;
  }

  .datum {
    position: relative;
    padding: 5px;
    margin-bottom: 16px;
  }

  .title {
    display: block;
    font-size: 130%;
    width: 100%;
  }

  .meta {
    display: block;
    width: 100%;
  }

  .abstract {
    display: inline-block;
    padding: 0;
    margin: 5px;
    font-family: CooperHewitt-Light;
    line-height: 18px;
  }

  .doi {
    padding: 0;
    margin: 5px;
    font-family: CooperHewitt-Medium;
    color: ${C.LIGHTGREY};
  }

  .doi a {
    color: ${C.LIGHTGREY};
  }

  .author {
    float: left;
    font-family: CooperHewitt-MediumItalic;
  }

  .date {
    float: right;
    font-family: CooperHewitt-Medium;
  }

  .wrapper {
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    height: calc(100% - ${padding}px);
    position: relative;
  }

  .empty {
    margin: 50px;
    font-size: 2em;
    font-family: Aleo-Light;
  }

  .quart {
    max-width 24%;
    position: relative;
  }

  `

  function getcontent (state) {
    const hasresults = state.results.length > 0
    if (!hasresults) return blank()

    if (state.selection.list.length === 1) {
      return singlepaper(state.selection.list[0], style, state, emit)
    } else if (state.selection.list.length > 1) {
      return multipaper(state.selection.list, style, state, emit)
    } else {
      return blank()
    }
  }

  function blank () {
    return html`<p class="${style.empty}">No paper selected.</p>`
  }

  return html`<div class="${style.detail}">${getcontent(state)}</div>`
}

function renderDate (date) {
  return `${date.day}/${date.month}/${date.year}`
}

function renderAuthor (author) {
  if (!author || author.length === 0) return html`<span>Anon</span>`

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

function renderAbstract (abstract) {
  return html('<span>' + abstract + '</span>')
}

function renderTitle (title) {
  return html('<span>' + title + '</span>')
}

function singlepaper (paper, style, state, emit) {
  if (!paper) return null

  const doibtn = html`<a href="#">${paper.id}</a>`
  doibtn.onclick = e => {
    e.preventDefault()
    open(`http://doi.org/${paper.id}`)
  }

  return html`

  <div class="${style.wrapper}">
    <div class="${style.row}">
      <div class="${style.paper}">
        <div class="${style.title} ${style.row} ${style.datum}">
          <span>${renderTitle(paper.title)}</span>
        </div>
        <div class="${style.meta} ${style.row} ${style.datum}">
          <div class="${style.author}">
            <span>${renderAuthor(paper.author)}</span>
          </div>
          <div class="${style.date}">
            <span>Published: ${paper.date ? renderDate(paper.date) : 'unknown'}</span>
          </div>
        </div>
        <div class="${style.abstract} ${style.row} ${style.datum}">
          ${renderAbstract(paper.abstract)}
        </div>
        <div class="${style.doi} ${style.row} ${style.datum}">
          <span>DOI: ${doibtn}</span>
        </div>
      </div>
      <div class="${style.column}">
        ${require('./detail_actions')(state, emit)}
        ${require('./detail_tags')(paper.tags.filter(t => t !== '__local'), state, emit)}
      </div>
    </div>
  </div>

  `
}

function tags (papers) {
  return intersection(...(papers.map(paper => paper.tags.filter(t => t !== '__local')))) || []
}

function multipaper (papers, style, state, emit) {
  return html`

  <div class="${style.wrapper}">
    <div class="${style.row} ${style.nottitle}">
      <div class="${style.column} ${style.quart}">
        ${require('./detail_multi_terms')(papers, state, emit)}
      </div>
      <div class="${style.column} ${style.quart}">
        ${require('./detail_multi_authors')(papers, state, emit)}
      </div>
      <div class="${style.column} ${style.quart}">
        ${require('./detail_multi_dates')(papers, state, emit)}
      </div>
      <div class="${style.column} ${style.quart}">
        ${require('./detail_actions')(state, emit)}
        ${require('./detail_tags')(tags(papers), state, emit)}
      </div>
    </div>
  </div>

  `
}
