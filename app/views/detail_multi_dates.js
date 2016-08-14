const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../lib/constants')

const flatten = require('lodash/flatten')
const countBy = require('lodash/countBy')
const isString = require('lodash/isString')
const sortBy = require('lodash/sortBy')
const toPairs = require('lodash/toPairs')
const min = require('lodash/min')
const max = require('lodash/max')

const maxwidth = 100

const style = css`

.plot {

}

.table {
  font-family: CooperHewitt-Medium;
}

.th {
  padding: 3px;
  text-align: left;
  font-weight: bold;
  font-family: CooperHewitt-Bold;
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
}

`

module.exports = (papers, state, prev, send) => {
  return html`

  <div class="${style.plot}">
    ${plot(daterangecount(papers))}
  </div>


  `
}

function plot (authorcounts) {
  const maxcount = max(authorcounts.map((ac) => ac.count))
  const unit = maxwidth / maxcount

  return html`
    <table class="${style.table}">
      <tr>
        <th class="${style.th}">
          Year
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
      <td class="${style.td}">
        ${ac.year}
      </td>
      <td class="${style.td}">
        <div class="${style.bar}" style="width: ${unit * ac.count}px;">
        </div>
      </td>
    </tr>
  `
}

function daterangecount (papers) {
  const years = {}

  papers.forEach((paper) => {
    const year = paper.document.date.year
    const count = years[year] || 0
    years[year] = count + 1
  })

  const from = min(Object.keys(years))
  const to = max(Object.keys(years))

  for (var year = from; year <= to; year++) {
    years[year] = years[year] || 0
  }

  return sortBy(toPairs(years), 0)
    .map((pair) => {
      return { year: pair[0], count: pair[1] }
    })
}
