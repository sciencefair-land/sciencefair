module.exports = (state, data, send, done) => {
  const papers = state.tags.tags[data.tag]

  const removeidx = papers.indexOf(data.paper.key)
  const newPapers = papers.slice()
  if (removeidx > -1) papers.splice(removeidx, 1)

  send('tag_replace', { tag: data.tag, papers: newPapers }, done)
}
