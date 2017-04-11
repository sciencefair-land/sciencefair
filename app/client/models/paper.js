const uniq = require('lodash/uniq')

module.exports = (state, bus) => {
  const selectshow = data => {
    bus.emit('selection:update', data)
    bus.emit('detail:show')
  }

  const addtag = tag => {
    const newpapers = state.selection.list.map(paper => {
      if ((paper.tags || []).length === 0) paper.download(() => {})
      paper.tags = uniq((paper.tags || []).concat([tag]))
      return paper
    })

    bus.emit('results:replace', {
      key: newpapers.map(p => p.key),
      paper: newpapers
    })

    bus.emit('collection:updatepaper', newpapers)
  }

  const removetag = tag => {
    const papers = state.selection.list

    const newPapers = papers.map(paper => {
      const tags = paper.tags
      const removeidx = tags.indexOf(tag)
      if (removeidx > -1) tags.splice(removeidx, 1)

      paper.tags = tags
      return paper
    })

    bus.emit('results:replace', {
      key: papers.map(p => p.key),
      paper: newPapers
    })

    bus.emit('collection:updatepaper', newPapers)
  }

  bus.on('paper:select-show', selectshow)
  bus.on('paper:add-tag', addtag)
  bus.on('paper:remove-tag', removetag)
}
