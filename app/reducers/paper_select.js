module.exports = (data, state) => {
  if (state.selectedpaper === data.index) {
    return { selectedpaper: -1 }
  } else {
    return { selectedpaper: data.index }
  }
}
