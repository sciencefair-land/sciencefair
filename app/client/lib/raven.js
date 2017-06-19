const raven = require('raven')
const os = require('os')

const RAVEN_A = '095b3facc71344ce9d665455045f5041'
const RAVEN_B = '03209bde9769408a83b75cf33a6d3f2d'
const RAVEN_C = '180723'

const getopts = processtype => {
  return {
    captureUnhandledRejections: true,
    name: 'sciencefair',
    release: require('../../package.json').version,
    extra: {
      platform: os.platform(),
      process: processtype,
      release: os.release(),
      arch: os.arch(),
      totalmem: os.totalmem()
    },
    sendTimeout: 5,
    allowSecretKey: processtype === 'browser',
    debug: true
  }
}

const setup = function () {
  if (process.type === 'browser') {
    // main process

    process.on('uncaughtException', (err) => {
      const dialog = require('electron').dialog

      dialog.showMessageBox({
        title: 'An error occurred',
        message: 'Sorry for the trouble, but an error has occurred in ScienceFair and we don\'t know how to recover from it.\n\nIf you are connected to the internet, this has been reported anonymously to the project maintainers - they will work on a fix.\n\nThe app may now quit - you can safely reopen it.',
        detail: err.stack,
        buttons: ['OK']
      })
    })

    const raven = require('raven')

    const url = `https://${RAVEN_A}:${RAVEN_B}@sentry.io/${RAVEN_C}`

    const sentry = raven.config(url, getopts(process.type)).install()

    return sentry
  } else if (process.type === 'renderer') {
    // renderer process
    const raven = require('raven-js')

    const url = `https://${RAVEN_A}@sentry.io/${RAVEN_C}`

    const sentry = raven.config(url, getopts(process.type)).install()

    const logerr = console.error

    // suppress bad error behaviour by Bunyan/Dtrace
    console.error = function () {
      const err = arguments[0]
      const iserr = err instanceof Error
      const isdtrace = iserr && /DTraceProviderBindings/.test(err.message)
      if (isdtrace) {
        console.log('caught and handled badly behaved error from dependency')
        sentry.captureException(new Error('Bunyan DTraceProviderBindings missing'))
      } else {
        logerr(...arguments)
      }
    }

    return sentry
  }
}

module.exports = setup
