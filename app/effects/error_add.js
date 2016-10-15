const cloneDeep = require('lodash/cloneDeep')
const uuid = require('uuid').v4

module.exports = (data, state, send, done) => {
  const update = cloneDeep(state.errors)
  const errorId = uuid()
  update[errorId] = data

  send('errors_set', update, err => {
    if (err) done(err)

    setTimeout(() => send('error_remove', errorId, done), 50000)
  })
}
