module.exports = (data, state) => {
  // TODO: intelligent merging of results based on TF-IDF score
  return { results: state.results.concat(data.results) }
}
