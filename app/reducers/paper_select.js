module.exports = (data, state) => {
  if (state.selectedpaper === data.index) {
    return { selectedpaper: null }
  } else {
    return { selectedpaper: data.index }
  }
}
