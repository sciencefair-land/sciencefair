const filter = require('lodash/filter')
const uniq = require('lodash/uniq')

module.exports = (state, bus) => {
  state.search = {
    querystring: '',
    query: null,
    tagquery: null,
    tags: [],
    clearing: false,
    searching: false
  }

  const render = () => bus.emit('renderer:render')

  const setstring = str => { state.search.querystring = str }
  const getstring = () => state.search.querystring

  const getquery = () => state.search.query
  const setquery = query => {
    state.search.query = query
    render()
  }

  const gettags = () => state.search.tags
  const settags = tags => { state.search.tags = tags }
  const tagquery = str => { return /#/.test(str) }

  const setsearching = bool => { state.search.searching = bool }
  const setclearing = bool => { state.search.clearing = bool }

  const settagquery = tagquery => {
    state.search.tagquery = tagquery
    render()
  }

  const cancelrunning = () => {
    bus.emit('datasources:cancel-search')
    bus.emit('collection:cancel-search')
    bus.emit('results:clear')
    bus.emit('selection:clear')
  }

  const update = () => {
    setsearching(true)
    // if query is '*' or we have tags, don't search datasources
    const searchdatasources = getquery() &&
      getquery()[0] !== '*' &&
      !gettags().length
    if (searchdatasources) bus.emit('datasources:search')
    bus.emit('collection:search')
  }

  const setquerystring = querystring => {
    if (querystring === getstring()) return

    setstring(querystring)

    const hastags = tagquery(querystring)
    if (hastags) {
      const queryparts = querystring.split('#')

      setquery(queryparts[0] || null)
      settagquery(queryparts[1] || '#')
    } else {
      setquery(querystring)
    }

    cancelrunning()
    update()
  }

  const clear = () => {
    setstring('')
    setquery(null)
    settagquery(null)
    settags([])
    setclearing(true)
    setsearching(false)
    bus.emit('results:clear')
    bus.emit('selection:clear')
  }

  const cleared = () => setclearing(false)

  const addtag = tag => {
    bus.emit('results:clear')
    const tags = uniq(gettags()).concat(tag)
    settags(tags)
    settagquery(null)
    setstring(getquery())
    render()
    update()
  }

  const removetag = tag => {
    bus.emit('results:clear')
    const tags = filter(gettags(), t => t !== tag)
    settags(tags)
    if (gettags().length === 0 && !getquery()) return clear()
    render()
    update()
  }

  const done = () => setsearching(false)

  bus.on('search:set-query-string', setquerystring)
  bus.on('search:clear', clear)
  bus.on('search:done-clearing', cleared)
  bus.on('search:done-searching', done)

  bus.on('search:add-tag', addtag)
  bus.on('search:remove-tag', removetag)
}
