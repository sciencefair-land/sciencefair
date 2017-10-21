const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../constants')

const flatten = require('lodash/flatten')
const countBy = require('lodash/countBy')
const isString = require('lodash/isString')
const sortBy = require('lodash/sortBy')
const toPairs = require('lodash/toPairs')
const max = require('lodash/max')
const uniqBy = require('lodash/uniqBy')

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
  font-family: CooperHewitt-Medium;
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
    ${plot(authorcount(papers))}
  </div>


  `
}

function plot (authorcounts) {
  const maxcount = max(authorcounts.map(counts))
  const unit = 100 / maxcount

  return html`
    <table class="${style.table}">
      <tr>
        <th class="${style.th} ${style.class}">
          Author
        </th>
        <th class="${style.th}">
          Papers
        </th>
      </tr>
      ${authorcounts.slice(0, 5).map((ac) => {
        return plotrow(ac, unit)
      })}
    </table>
  `
}

function plotrow (ac, unit) {
  return html`
    <tr>
      <td class="${style.td} ${style.class}">
        ${ac.author}
      </td>
      <td class="${style.td}">
        <div class="${style.bar}" style="width: ${unit * ac.count}%">
          ${ac.count}
        </div>
      </td>
    </tr>
  `
}

function authorcount (papers) {
  const authors = uniqBy(papers, 'key').map(paper => {
    const author = paper.author

    if (!author) return null

    if (isString(author)) {
      return author.split(',').map((a) => a.trim())
    } else {
      return author.map((a) => {
        return `${a['given-names'].slice(0, 1)} ${a.surname}`
      })
    }
  })

  const counts = countBy(flatten(authors.filter(nonull)))

  return sortBy(toPairs(counts), 1)
    .reverse()
    .map((pair) => {
      return { author: pair[0], count: pair[1] }
    })
}

function counts (authorcount) { return authorcount.count }

function nonull (a) { return a !== null }
