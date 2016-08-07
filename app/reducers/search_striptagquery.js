module.exports = (data, state) => {
  console.log('reducer: search_striptagquery')
  const oldsearch = state.currentsearch

  return {
    currentsearch: {
      query: oldsearch.query,
      tags: oldsearch.tags,
      tagquery: oldsearch.tagquery,
      striptagquery: true
    }
  }
}
