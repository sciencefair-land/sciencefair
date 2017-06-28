if (!process.env['SCIENCEFAIR_DEVMODE']) require('./client/lib/raven')()
require('./run.js')
