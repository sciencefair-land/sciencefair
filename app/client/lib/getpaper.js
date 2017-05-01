const Paper = require('./paper')

const papers = {}

module.exports = (data, skipcache) => {
  if (skipcache) return Paper(data)
  const key = typeof data === 'string' ? data : `${data.source}:${data.id}`
  const paper = papers[key] || Paper(data)
  papers[key] = paper
  return paper
}
