const includes = require('lodash/includes')
const keys = require('lodash/keys')
const uniq = require('lodash/uniq')
const diff = require('lodash/difference')

module.exports = (state, bus) => {
  state.tags = {
    tags: {
      tag1: ['blah'],
      tag2: ['blah']
    },
    showAddField: false,
    loaded: true
  }

  const render = () => bus.emit('render')
  const selected = () => state.selection.list.map(p => p.key)
  const replace = tags => { state.tags.tags = tags }
  const get = tag => state.tags.tags[tag] || []
  const set = (tag, papers) => { state.tags.tags[tag] = papers }

  const add = tag => {
    const papers = get(tag)
    const newPapers = uniq(papers.concat(selected()))
    set(tag, newPapers)
  }

  const remove = tag => {
    const papers = get(tag)
    const newPapers = diff(papers, selected())
    set(tag, newPapers)
  }

  const startadd = () => {
    state.tags.showAddField = true
    render()
  }

  const stopadd = () => {
    state.tags.showAddField = false
    render()
  }

  bus.on('tags:add', tag => {
    add(tag)
    stopadd()
    bus.emit('paper:add-tag', tag)
    render()
  })

  bus.on('tags:remove', tag => {
    remove(tag)
    render()
  })

  bus.on('tags:replace', replace)
  bus.on('tags:start-add', startadd)
  bus.on('tags:stop-add', stopadd)
  bus.on('tags:setall', replace)
}
