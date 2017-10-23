const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../constants')

const flatten = require('lodash/flatten')
const countBy = require('lodash/countBy')
const sortBy = require('lodash/sortBy')
const toPairs = require('lodash/toPairs')
const max = require('lodash/max')
const difference = require('lodash/difference')
const uniq = require('lodash/uniq')
const uniqBy = require('lodash/uniqBy')
const stopword = require('stopword')

const stopwords = [
  'published', 'study',
  'between', 'experiment', 'experiments', 'results', 'biology',
  'et', 'al', 'al.', 'al.,', 'project:',
  'show', 'during',
  'required', 'additional', 'because',
  'one', 'two', 'three', 'four', 'five',
  'six', 'seven', 'eight', 'nine', 'ten',
  'report', 'key'
]

const style = css`

.plot {
  border-right: 1px solid ${C.LIGHTGREY};
  padding: 10px 20px;
  height: 100%;
}

.table {
  font-family: CooperHewitt-Light;
  width: 100%;
}

.class { width: 100px; }

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

module.exports = (papers, state, emit) => {
  return html`

  <div class="${style.plot}">
    ${plot(termcount(papers))}
  </div>

  `
}

function plot (termcounts) {
  const maxcount = max(termcounts.map((tc) => tc.count))
  const unit = 100 / maxcount

  return html`
    <table class="${style.table}">
      <tr>
        <th class="${style.th} ${style.class}">
          Term
        </th>
        <th class="${style.th}">
          Papers
        </th>
      </tr>
      ${termcounts.slice(0, 5).map(tc => plotrow(tc, unit))}
    </table>
  `
}

function plotrow (tc, unit) {
  return html`
    <tr>
      <td class="${style.td} ${style.class}">
        ${tc.term}
      </td>
      <td class="${style.td}">
        <div class="${style.bar}" style="width: ${unit * tc.count}%">
          ${tc.count}
        </div>
      </td>
    </tr>
  `
}

function termcount (papers) {
  const terms = uniqBy(papers, 'key').map(paper => {
    const title = cleanTerms(paper.title ? paper.title : '')
    const abstract = cleanTerms(paper.abstract ? paper.abstract : '')

    let termset = uniq(title.concat(abstract))
    termset = stopword.removeStopwords(termset)
    termset = stopword.removeStopwords(termset, stopwords)
    return termset.map(term => {
      if (term === 'cells') return 'cell'
      if (term === 'genes') return 'gene'
      return term
    })
  })

  const counts = countBy(flatten(terms))

  return sortBy(toPairs(counts), 1)
    .reverse()
    .map((pair) => {
      return { term: pair[0], count: pair[1] }
    })
}

function cleanTerms (str) {
  return str
    .replace('.', '')
    .replace(/s$/, '')
    .split(' ')
    .map(term => term.toLowerCase()
      .replace(/[,.]/, '')
      .replace(/<\/?[^>]+>/g, '')
      .replace(/^[\W+]/, '')
      .replace(/[\W+]$/, '')
    )
}
