module.exports = (data, state) => {
  console.log('results received')

  const hits = data.hits.map((hit) => {
    if (!hit.tags) hit.tags = []
    return hit
  })

  // TODO: intelligent merging of results based on TF-IDF score
  return { results: state.results.concat(hits) }
}
