const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../lib/constants')

const isString = require('lodash/isString')
const intersection = require('lodash/intersection')

const height = 200
const padding = 5

module.exports = (state, prev, send) => {
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
  }

  .paper {
    width: 70%;
    overflow: auto;
    flex-direction: column;
    justify-content: space-between;
    padding: 10px;
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

  .abstract {
    padding: 0;
    margin: 5px;
    font-family: CooperHewitt-Light;
    line-height: 18px;
  }

  .author {
    font-family: CooperHewitt-MediumItalic;
    width: 100%;
  }

  .date {
    width: 100%;
    justify-content: flex-end;
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

    if (state.selection.papers.length === 1) {
      const id = state.selection.papers[0]
      const paper = state.results.find((result) => {
        return result.document.identifier[0].id === id
      })

      return singlepaper(paper, style, state, prev, send)
    } else if (state.selection.papers.length > 1) {
      const ids = state.selection.papers
      const papers = state.results.filter((result) => {
        const id = result.document.identifier[0].id
        return ids.indexOf(id) > -1
      })

      return multipaper(papers, style, state, prev, send)
    } else {
      return blank()
    }
  }

  function blank () {
    return html`

    <p class="${style.empty}">No paper selected.</p>

    `
  }

  return html`<div class="${style.detail}">${getcontent(state)}</div>`
}

function renderDate (date) {
  return `${date.day}/${date.month}/${date.year}`
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

function renderAbstract (abstract) {
  return html('<span>' + abstract + '</span>')
}

function singlepaper (paper, style, state, prev, send) {
  if (!paper) return null
  const doc = paper.document

  return html`

  <div class="${style.wrapper}">
    <div class="${style.row}">
      <div class="${style.paper}">
        <div class="${style.title} ${style.row} ${style.datum}">
          ${doc.title}
        </div>
        <div class="${style.row}">
          <div class="${style.author} ${style.datum}">${renderAuthor(doc.author)}</div>
          <div class="${style.date} ${style.datum}">
            Published:
            ${doc.date ? renderDate(doc.date) : 'unknown'}
          </div>
        </div>
        <div class="${style.abstract} ${style.row} ${style.datum}">
          ${renderAbstract(doc.abstract)}
        </div>
      </div>
      <div class="${style.column}">
        ${require('./detail_actions')(state, prev, send)}
        ${require('./detail_tags')(doc.tags, state, prev, send)}
      </div>
    </div>
  </div>

  `
}

function tags (papers) {
  return intersection(...(papers.map((paper) => paper.document.tags))) || []
}

function multipaper (papers, style, state, prev, send) {
  return html`

  <div class="${style.wrapper}">
    <div class="${style.row} ${style.nottitle}">
      <div class="${style.column} ${style.quart}">
        ${require('./detail_multi_terms')(papers, state, prev, send)}
      </div>
      <div class="${style.column} ${style.quart}">
        ${require('./detail_multi_authors')(papers, state, prev, send)}
      </div>
      <div class="${style.column} ${style.quart}">
        ${require('./detail_multi_dates')(papers, state, prev, send)}
      </div>
      <div class="${style.column} ${style.quart}">
        ${require('./detail_tags')(tags(papers), state, prev, send)}
      </div>
    </div>
  </div>

  `
}
