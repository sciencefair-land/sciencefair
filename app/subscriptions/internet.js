const online = require('is-online')

module.exports = (send, done) => setInterval(
  () => online((err, up) => {
    if (err) return console.log(err)
    send('online_update', up, err => {
      if (err) console.log('Error checking internet status:', err)
    })
  }),
  5000
)
