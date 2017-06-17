require('./lib/raven')().context(function () {
  require('./run.js')
})
