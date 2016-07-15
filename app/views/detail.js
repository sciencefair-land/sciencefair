const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../constants')

const isString = require('lodash/isString')

const height = 200
const padding = 10

module.exports = (state, prev, send) => {
  const style = css`

  .detail {
    position: absolute;
    height: ${state.detailshown ? height : 0}px;
    width: 100%;
    bottom: 80px;
    padding: ${state.detailshown ? padding : 0}px;
    margin: 0;
    flex-direction: row;
    overflow-y: hidden;
    background: ${C.DARKBLUE};
    opacity: 0.8;
    font-family: Aleo-Regular;
    font-size: 16px;
    color: ${C.LIGHTGREY};
  }

  .column {
    width: 50%;
    flex-direction: column;
    justify-content: space-between;
  }

  .row {
    flex-direction: row;
    justify-content: space-between;
  }

  .datum {
    padding: 5px;
    flex-grow: 1;
    flex-shrink: 0;
  }

  .title {
    display: block;
    font-size: 130%;
    height: 32px;
    width: 100%;
    margin-bottom: 16px;
    padding-right: 16px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .abstract {
    width: 100%;
    overflow: auto;
    flex-shrink: 1;
    padding: 0;
    margin: 5px;
    font-family: CooperHewitt-Light;
    line-height: 18px;
  }

  .author {
    font-family: CooperHewitt-MediumItalic;
  }

  .date {
    width: 100px;
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

  `

  function getcontent () {
    if (state.selectedpaper) {
      const index = state.selectedpaper
      const paper = state.results[index]

      return html`

      <div class="${style.wrapper}">
        <div class="${style.row}">
          <div class="${style.title} ${style.row} ${style.datum}">${paper.title}</div>
        </div>
        <div class="${style.row} ${style.nottitle}">
          <div class="${style.column}">
            <div class="${style.abstract} ${style.row} ${style.datum}">${paper.abstract}</div>
            <div class="${style.row}">
              <div class="${style.author} ${style.datum}">${renderAuthor(paper.author)}</div>
              <div class="${style.date} ${style.datum}">${renderDate(paper.date)}</div>
            </div>
          </div>
          <div class="${style.column}">
            ${require('./detail_tags')(state, prev, send)}
          </div>
        </div>
      </div>

      `
    } else {
      return html`

      <p>Select a paper to see detailed information here.</p>

      `
    }
  }

  return html`<div class="${style.detail}">${getcontent()}</div>`
}

function renderDate (date) {
  return `${date.day}/${date.month}/${date.year}`
}

function renderAuthor (author) {
  return isString(author) ? author : `${author.givenNames} ${author.surName}`
}
