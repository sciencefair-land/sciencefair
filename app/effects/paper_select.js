const cloneDeep = require('lodash/cloneDeep')
const findLastIndex = require('lodash/findLastIndex')
const difference = require('lodash/difference')
const uniq = require('lodash/uniq')
const keyby = require('lodash/keyby')

module.exports = (data, state, send, done) => {
  const update = cloneDeep(state.selection)
  const results = state.results

  const shift = data.shift
  const ctrl = data.ctrl || data.meta

  if (!results || results.length === 0) {
    // no results - clear selection
    update.reference = null
    update.list = []
  } else if (!shift && !ctrl) {
    // plain click
    // - select the clicked paper
    // - deselect everything else
    // - set clicked paper as reference
    update.list = [data.paper]
    update.reference = {
      index: data.index,
      paper: data.paper
    }
  } else if (ctrl) {
    // ctrl-click
    // - toggle the clicked paper
    // - clear the reference
    // - if clicked is now selected, set as reference
    update.list = toggleclicked(data, update.list)
    update.reference = null

    if (isselected(data, update.list)) {
      update.reference = {
        index: data.index,
        paper: paper
      }
    }
  } else if (data.shift) {
    // shift-click
    // - establish the reference paper
    // - turn off all selected papers contiguous in selection with the reference
    // - turn on selection between reference and clicked paper, inclusive
    // toggle the clicked paper
    // and set it as reference point
    update.reference = findreference(update, results)

    const contiguous = findcontiguous(update.reference, update.list, results)
    const nocontiguous = difference(update.list, contiguous)

    update.list = selectrange(results, nocontiguous, update.reference, data)
  }

  update.lookup = keyby(update.list, 'key')
  send('selection_set', update, done)
}

function isselected (data, papers) {
  return papers.indexOf(data.paper) > -1
}

function toggleclicked (data, papers) {
  const idx = papers.indexOf(data.paper)
  if (idx > -1) {
    const newpapers = papers.slice()
    newpapers.splice(idx, 1)
    return newpapers
  } else {
    return papers.concat([data.paper])
  }
}

// return true if the reference is unmoved within the results
// compared to when it was set as reference, false otherwise
function referenceunmoved (reference, results) {
  const result = results && results[reference.index]
  return result &&
    result.key === reference.key
}

// return the reference
function findreference (update, results) {
  if (update.reference && referenceunmoved(update.reference, results)) {
    // reference already defined and still valid
    return update.reference
  } else {
    // reference defaults to highest index selected paper
    // or if no papers are selected, first result
    var refindex = 0

    if (update.list && update.list.length) {
      const highest = findLastIndex(results, result => {
        return update.list.indexOf(result) > -1
      })
      refindex = Math.max(highest, 0)
    }

    const refresult = results[refindex]
    return {
      paper: refresult,
      index: refindex
    }
  }
}

// return the array of papers that are selected contiguously with
// the reference in results
function findcontiguous (reference, papers, results) {
  const contiguous = []

  var i = reference.index
  var current = results[i]

  // backwards
  while (current && isselected(current, papers) && i >= 0) {
    contiguous.push(current)
    i -= 1
    current = results[i]
  }

  // forwards
  i = reference.index + 1
  current = results[i]
  while (current && isselected(current, papers) && i < results.length) {
    contiguous.push(current)
    i += 1
    current = results[i]
  }

  return uniq(contiguous)
}

// return array of selected papers, including those originally selected
// and those between start and end in results, inclusive
function selectrange (results, papers, start, end) {
  const low = Math.min(start.index, end.index)
  const high = Math.max(start.index, end.index) + 1
  const morepapers = results.slice(low, high)
  return uniq(papers.concat(morepapers))
}
