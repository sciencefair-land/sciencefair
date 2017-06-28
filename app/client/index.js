if (!process.env['SCIENCEFAIR_DEVMODE']) require('./lib/raven')()
require('./run.js')
