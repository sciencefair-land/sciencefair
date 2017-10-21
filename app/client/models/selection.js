const findLastIndex = require('lodash/findLastIndex')
const difference = require('lodash/difference')
const uniq = require('lodash/uniq')
const keyby = require('lodash/keyBy')

const isselected = (data, papers) => papers.indexOf(data.paper) > -1

const toggleclicked = (data, papers) => {
  const idx = papers.map(p => p.key).indexOf(data.paper.key)
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
const referenceunmoved = (reference, results) => {
  const result = results && results[reference.index]
  return result && result.key === reference.key
}

// return the reference
const findreference = (selection, results) => {
  if (selection.reference && referenceunmoved(selection.reference, results)) {
    // reference already defined and still valid
    return selection.reference
  } else {
    // reference defaults to highest index selected paper
    // or if no papers are selected, first result
    var refindex = 0

    if (selection.list && selection.list.length) {
      const updatekeys = selection.list.map(p => p.key)
      const highest = findLastIndex(results, result => {
        return updatekeys.indexOf(result.key) > -1
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
const findcontiguous = (reference, papers, results) => {
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
const selectrange = (results, papers, start, end) => {
  const low = Math.min(start.index, end.index)
  const high = Math.max(start.index, end.index) + 1
  const morepapers = results.slice(low, high)
  return uniq(papers.concat(morepapers))
}

module.exports = (state, bus) => {
  state.selection = {
    reference: null,
    list: [],
    lookup: {}
  }

  const render = () => bus.emit('renderer:render')

  const get = () => state.selection

  const setref = ref => { state.selection.reference = ref }
  const getref = () => state.selection.reference

  const setlist = list => {
    getlist().forEach(p => p.deselect())
    list.forEach(p => p.select())
    state.selection.list = list
  }
  const getlist = () => state.selection.list

  const setlookup = lookup => { state.selection.lookup = lookup }

  const clear = () => {
    setref(null)
    setlist([])
    setlookup({})
    render()
  }

  const update = data => {
    const results = state.results

    const shift = data.shift
    const ctrl = data.ctrl || data.meta

    if (!results || results.length === 0) {
      // no results - clear selection
      setref(null)
      setlist([])
    } else if (!shift && !ctrl) {
      // plain click
      // - select the clicked paper
      // - deselect everything else
      // - set clicked paper as reference
      setlist([data.paper])
      setref({
        index: data.index,
        paper: data.paper
      })
    } else if (ctrl) {
      // ctrl-click
      // - toggle the clicked paper
      // - clear the reference
      // - if clicked is now selected, set as reference
      setlist(toggleclicked(data, getlist()))
      setref(null)

      if (isselected(data, getlist())) {
        setref({
          index: data.index,
          paper: data.paper
        })
      }
    } else if (data.shift) {
      // shift-click
      // - establish the reference paper
      // - turn off all selected papers contiguous in selection with the reference
      // - turn on selection between reference and clicked paper, inclusive
      // toggle the clicked paper
      // and set it as reference point
      setref(findreference(get(), results))

      const contiguous = findcontiguous(getref(), getlist(), results)
      const nocontiguous = difference(getlist(), contiguous)

      setlist(selectrange(results, nocontiguous, getref(), data))
    }

    setlookup(keyby(getlist(), 'key'))
    render()
  }

  const all = () => {
    setref({
      index: 0,
      paper: state.results[0]
    })
    setlist(state.results.slice())
    setlookup(keyby(getlist(), 'key'))
    render()
  }

  bus.on('selection:all', all)
  bus.on('selection:clear', clear)
  bus.on('selection:update', update)
}
