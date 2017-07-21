const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../constants')

const sortBy = require('lodash/sortBy')
const toPairs = require('lodash/toPairs')
const min = require('lodash/min')
const max = require('lodash/max')

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

.class { width: 50px; }

.th {
  padding: 3px;
  text-align: left;
  font-weight: bold;
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
}

.innerbar {
  padding: 2px 4px;
}

.zero {
  color: ${C.LIGHTGREY};
}

`

module.exports = (papers, state, emit) => {
  return html`

  <div class="${style.plot}">
    ${plot(daterangecount(papers))}
  </div>


  `
}

function plot (daterangecounts) {
  const maxcount = max(daterangecounts.map((ac) => ac.count))
  const unit = 100 / maxcount

  return html`
    <table class="${style.table}">
      <tr>
        <th class="${style.th} ${style.class}">
          Year
        </th>
        <th class="${style.th}">
          Papers
        </th>
      </tr>
      ${daterangecounts.slice(0, 5).map((ac) => {
        return plotrow(ac, unit)
      })}
    </table>
  `
}

function plotrow (ac, unit) {
  return html`
    <tr>
      <td class="${style.td} ${style.class}">
        ${ac.year}
      </td>
      <td class="${style.td}">
        <div class="${style.bar}" style="width: ${unit * ac.count}%">
          <span class="${style.innerbar} ${ac.count === 0 ? style.zero : ''}">${ac.count}</span>
        </div>
      </td>
    </tr>
  `
}

function daterangecount (papers) {
  const years = {}

  papers.forEach((paper) => {
    const year = paper.date.year
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
