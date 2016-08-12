const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../lib/constants')

const isString = require('lodash/isString')

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

  .row {
    flex-direction: row;
    justify-content: space-between;
  }

  .datum {
    position: absolute;
    padding: 5px;
  }

  .title {
    position: absolute;
    display: block;
    font-size: 130%;
    top: 0;
    left: 0;
    right: 0;
    height: 32px;
    width: 100%;
    padding-right: 16px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .abstract {
    top: ${32 + 4}px;
    left: 0;
    width: 50%;
    bottom: 34px;
    overflow: auto;
    padding: 0;
    margin: 5px;
    font-family: CooperHewitt-Light;
    line-height: 18px;
  }

  .author {
    left: 0;
    bottom: 0;
    font-family: CooperHewitt-MediumItalic;
  }

  .date {
    bottom: 0;
    right: 50%;
    width: 170px;
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

  .nottitle {
    flex-shrink: 1;
  }

  .empty {
    margin: 50px;
    font-size: 2em;
    font-family: Aleo-Light;
  }

  `

  function getcontent () {
    if (state.selection.papers.length === 1) {
      const id = state.selection.papers[0]
      const paper = state.results.find((result) => {
        return result.id === id
      })

      if (!paper) {
        return blank()
      } else {
        return singlepaper(paper, style, state, prev, send)
      }
    } else if (state.selection.papers.length > 1) {
      const ids = state.selection.papers
      const papers = state.results.filter((result) => {
        return ids.indexOf(result.id) > -1
      })

      if (papers.length === 0) {
        return blank()
      } else {
        return multipaper(papers, style, state, prev, send)
      }
    } else {
      return blank()
    }
  }

  function blank () {
    return html`

    <p class="${style.empty}">No paper selected.</p>

    `
  }

  return html`<div class="${style.detail}">${getcontent()}</div>`
}

function renderDate (date) {
  return `${date.day}/${date.month}/${date.year}`
}

function renderAuthor (author) {
  return isString(author) ? author : `${author.givenNames} ${author.surName}`
}

function singlepaper (paper, style, state, prev, send) {
  const doc = paper.document

  return html`

  <div class="${style.wrapper}">
    <div class="${style.row}">
      <div class="${style.title} ${style.row} ${style.datum}">${doc.title}</div>
    </div>
    <div class="${style.row} ${style.nottitle}">
      <div class="${style.column}">
        <div class="${style.abstract} ${style.row} ${style.datum}">${doc.abstract}</div>
        <div class="${style.row}">
          <div class="${style.author} ${style.datum}">${renderAuthor(doc.author)}</div>
          <div class="${style.date} ${style.datum}">
            Published:
            ${doc.date ? renderDate(doc.date) : 'unknown'}
          </div>
        </div>
      </div>
      <div class="${style.column}">
        ${require('./detail_single_license')(doc.license, state, prev, send)}
        ${require('./detail_single_tags')(state, prev, send)}
      </div>
    </div>
  </div>

  `
}

function multipaper (papers, style, state, prev, send) {
  return html`

  <div class="${style.wrapper}">
    <div class="${style.row}">
      <div class="${style.title} ${style.row} ${style.datum}">
        ${papers.length} papers selected
      </div>
    </div>
  </div>

  `
}
