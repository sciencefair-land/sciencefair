// replace `state.tags.tags` with `data`,
// which should be an object where each:
//   key = the tag
//   value = array of paper IDs with this tag
module.exports = (state, data) => {
  return {
    tags: {
      tags: data,
      showAddField: state.tags.showAddField,
      loaded: true
    }
  }
}
