const uniqBy = require('lodash/uniqBy')
const sortBy = require('lodash/sortBy')
const isArray = require('lodash/isArray')

const paper = require('../lib/getpaper')


module.exports = (state, bus) => {
  state.results = []

  const debug = msg => bus.emit('log:debug', '[model:results] ' + msg)
  const querystring = () => {
    const query = state.search
    return `'${query.query}${query.tags.map(t => ` #${t}`)}'`
  }
  const render = () => bus.emit('render')

  const get = () => state.results
  const set = results => { state.results = results }
  const setone = (idx, result) => { state.results[idx] =  result }

  const clear = () => {
    set([])
    render()
    debug('results cleared')
  }

  const receive = incoming => {
    const papers = incoming.hits.map(paper)
    papers.forEach(p => p.filesPresent(() => {}))

    set(uniqBy(get().concat(papers), result => result.key))
    if (get().length < 200) render()
    debug(`received ${incoming.hits.length} results, for ${querystring()}`)
  }

  const replace = data => {
    const resultkeys = get().map(r => r.key)

    const keys = isArray(data.key) ? data.key : [data.key]
    const indices = keys.map(key => resultkeys.indexOf(key))
    const papers = isArray(data.paper) ? data.paper : [data.paper]

    for (let i in indices) {
      let idx = indices[i]
      let paper = papers[i]
      setone(idx, paper)
    }

    render()
    debug('results replaced')
  }

  const none = datasource => {
    debug(`no results in ${datasource} for ${querystring()}`)
  }

  const count = data => {
    if (get().length >= 200) render()
    debug(`${data.count} results in ${data.source} for ${querystring()}`)
  }

  bus.on('results:clear', clear)
  bus.on('results:receive', receive)
  bus.on('results:replace', replace)
  bus.on('results:none', none)
  bus.on('results:count', count)
}
