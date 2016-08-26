const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../lib/constants')

const flatten = require('lodash/flatten')
const countBy = require('lodash/countBy')
const sortBy = require('lodash/sortBy')
const toPairs = require('lodash/toPairs')
const max = require('lodash/max')
const difference = require('lodash/difference')

const stopwords = [
  'and', 'but', 'the', 'a', 'an', 'and', 'so', 'yet', 'of', 'in', 'to', 'by',
  'is', 'that', 'for', 'we', 'published', 'study', 'from', 'with', 'as', 'on',
  'between', 'experiment', 'experiments', 'results', 'biology', 'are', 'this',
  'et', 'al', 'al.', 'al.,', 'be', 'project:', 'which', 'these', 'or', 'have', 'at', 'our', 'were', 'show', 'during', 'can', 'not', 'its', 'their'
]

const maxwidth = 200

const style = css`

.plot {
  border-right: 1px solid ${C.LIGHTGREY};
  padding: 10px 20px;
  height: 100%;
}

.table {
  font-family: CooperHewitt-Light;
}

.th {
  padding: 3px;
  text-align: left;
  font-family: CooperHewitt-Medium  ;
}

.tr {

}

.td {
  padding: 3px;
  padding-bottom: 0;
}

.bar {
  height: 20px;
  background: ${C.LIGHTGREY};
  color: ${C.MIDBLUE};
  padding: 2px 4px;
}

`

module.exports = (papers, state, prev, send) => {
  return html`

  <div class="${style.plot}">
    ${plot(termcount(papers))}
  </div>


  `
}

function plot (termcounts) {
  const maxcount = max(termcounts.map((tc) => tc.count))
  const unit = maxwidth / maxcount

  return html`
    <table class="${style.table}">
      <tr>
        <th class="${style.th}">
          Term
        </th>
        <th class="${style.th}">
          Papers
        </th>
      </tr>
      ${termcounts.slice(0, 5).map((ac) => {
        return plotrow(ac, unit)
      })}
    </table>
  `
}

function plotrow (tc, unit) {
  return html`
    <tr>
      <td class="${style.td}">
        ${tc.term}
      </td>
      <td class="${style.td}">
        <div class="${style.bar}" style="width: ${unit * tc.count}px;">
          ${tc.count}
        </div>
      </td>
    </tr>
  `
}

function termcount (papers) {
  const terms = papers.map((paper) => {
    const title = (paper.document.title ? paper.document.title : '')
      .replace('.', '').split(' ')
      .map(term => term.toLowerCase())
    const abstract = (paper.document.abstract ? paper.document.abstract : '')
      .replace('.', '').split(' ')
      .map(term => term.toLowerCase())
    return difference(title.concat(abstract), stopwords)
  })

  const counts = countBy(flatten(terms))

  return sortBy(toPairs(counts), 1)
    .reverse()
    .map((pair) => {
      return { term: pair[0], count: pair[1] }
    })
}
