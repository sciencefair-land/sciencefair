const uniq = require('lodash/uniq')
const diff = require('lodash/difference')

module.exports = (state, bus) => {
  state.tags = {
    tags: {},
    showAddField: false,
    loaded: true
  }

  const render = () => bus.emit('renderer:render')
  const replace = tags => { state.tags.tags = tags }
  const get = tag => state.tags.tags[tag] || []
  const set = (tag, papers) => { state.tags.tags[tag] = papers }

  const add = data => {
    const papers = get(data.tag)
    const newPapers = uniq(papers.concat(data.papers))
    set(data.tag, newPapers)
  }

  const remove = data => {
    const papers = get(data.tag)
    const newPapers = diff(papers, data.papers)
    set(data.tag, newPapers)
  }

  const startadd = () => {
    state.tags.showAddField = true
    render()
  }

  const stopadd = () => {
    state.tags.showAddField = false
    render()
  }

  bus.on('tags:add', data => {
    add(data)
    stopadd()
    bus.emit('paper:add-tag', data)
    render()
  })

  bus.on('tags:remove', data => {
    remove(data)
    bus.emit('paper:remove-tag', data)
    render()
  })

  bus.on('tags:replace', replace)
  bus.on('tags:start-add', startadd)
  bus.on('tags:stop-add', stopadd)
  bus.on('tags:setall', replace)
}
