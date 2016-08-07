module.exports = (data, state) => {
  const oldsearch = state.currentsearch

  return {
    currentsearch: {
      query: oldsearch.query,
      tags: oldsearch.tags,
      tagquery: null,
      striptagquery: false
    }
  }
}
