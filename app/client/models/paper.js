const uniq = require('lodash/uniq')

module.exports = (state, bus) => {
  const render = () => bus.emit('renderer:render')

  const selectshow = data => {
    bus.emit('selection:update', data)
    bus.emit('detail:show')
  }

  const addtag = data => {
    const newpapers = data.papers.map(paper => {
      if ((paper.tags || []).length === 0) {
        bus.emit('downloads:add', paper)
      }
      paper.tags = uniq((paper.tags || []).concat([data.tag]))
      return paper
    })

    render()
    bus.emit('collection:update-paper', newpapers)
  }

  const removetag = data => {
    const newpapers = data.papers.map(paper => {
      const tags = paper.tags
      const removeidx = tags.indexOf(data.tag)
      if (removeidx > -1) tags.splice(removeidx, 1)

      paper.tags = tags
      return paper
    })

    render()
    bus.emit('collection:update-paper', newpapers)
  }

  bus.on('paper:select-show', selectshow)
  bus.on('paper:add-tag', addtag)
  bus.on('paper:remove-tag', removetag)
}
