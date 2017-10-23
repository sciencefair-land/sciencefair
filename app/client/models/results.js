const uniqBy = require('lodash/uniqBy')
const paper = require('../lib/getpaper')

module.exports = (state, bus) => {
  state.results = []

  const debug = msg => bus.emit('log:debug', '[model:results] ' + msg)
  const render = () => bus.emit('renderer:render')

  const querystring = () => {
    const query = state.search
    return `'${query.query}${query.tags.map(t => ` #${t}`)}'`
  }

  const get = () => state.results
  const set = results => { state.results = results }

  const clear = () => {
    set([])
    render()
    debug('results cleared')
  }

  const checkfiles = p => p.filesPresent(
    (err, progress, updated) => { if (!err && updated) render() }
  )

  const receive = incoming => {
    bus.emit('search:done-searching')
    const papers = incoming.hits.map(hit => paper(hit))
    papers.forEach(checkfiles)

    set(uniqBy(get().concat(papers), result => result.key))
    if (get().length < 30) render()
    debug(`received ${incoming.hits.length} results, for ${querystring()}`)
  }

  const replace = data => {
    set(data)
    render()
    debug('results replaced')
  }

  const count = data => {
    if (get().length >= 30) render()
    debug(`${data.count} results in ${data.source} for ${querystring()}`)
  }

  const remove = data => {
    const idx = get().indexOf(data)
    if (idx > -1) get().splice(idx, 1)
    render()
    debug('result removed')
  }

  bus.on('results:clear', clear)
  bus.on('results:receive', receive)
  bus.on('results:replace', replace)
  bus.on('results:remove', remove)
  bus.on('results:count', count)
}
