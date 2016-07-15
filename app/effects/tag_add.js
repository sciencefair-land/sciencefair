const includes = require('lodash/includes')
const after = require('lodash/after')

module.exports = (data, state, send, done) => {
  const alldone = after(1, done)
  const newtag = !includes(state.tags, data.tag)

  function tick (err) {
    if (err) done(err)
    alldone()
  }

  // send(newtag ? 'tag_createnew' : 'tag_addpaper', data, tick)
  send('paper_addtag', data, tick)
}
