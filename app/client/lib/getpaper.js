const Paper = require('./paper')

window.papers = window.papers || {}

module.exports = (data, skipcache) => {
  if (skipcache) return Paper(data)
  const key = typeof data === 'string' ? data : `${data.source}:${data.id}`
  const paper = window.papers[key] || Paper(data)
  window.papers[key] = paper
  return paper
}
