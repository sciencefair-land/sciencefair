const cloneDeep = require('lodash/cloneDeep')
const uuid = require('uuid').v4

module.exports = (state, data, send, done) => {
  if (!data.message) return done()
  const update = cloneDeep(state.notes)
  const noteId = uuid()
  update[noteId] = data

  send('notes_set', update, err => {
    if (err) done(err)

    setTimeout(() => send('note_remove', noteId, done), 3000)
  })
}
