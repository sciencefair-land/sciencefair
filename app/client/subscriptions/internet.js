const online = require('is-online')

module.exports = (send, done) => setInterval(
  () => online((err, up) => {
    if (err) return console.log(err)
    send('online_update', up, err => {
      if (err) return done(err)
    })
  }),
  5000
)
