const raven = require('raven')
const os = require('os')

const RAVEN_A = '095b3facc71344ce9d665455045f5041'
const RAVEN_B = '03209bde9769408a83b75cf33a6d3f2d'
const RAVEN_C = '180723'

const url = `https://${RAVEN_A}:${RAVEN_B}@sentry.io/${RAVEN_C}`

const opts = {
  captureUnhandledRejections: true,
  name: 'sciencefair',
  release: require('../../package.json').version,
  extra: {
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    totalmem: os.totalmem()
  }
}

const bird = raven.config(url, opts).install()

module.exports = () => bird
