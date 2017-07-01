if (process.env.SCIENCEFAIR_DEVMODE) {
  localStorage.setItem('debug', process.env.DEBUG)
  localStorage.setItem('logLevel', 'debug')
  require('debug-menu').install()
} else {
  // suppress choo-log in production
  localStorage.setItem('logLevel', 'error')
  // suppress nanotiming in production
  window.localStorage.DISABLE_NANOTIMING = true
}

const C = require('./constants')
const mkdirp = require('mkdirp').sync

mkdirp(C.DATAROOT)
mkdirp(C.COLLECTION_PATH)
mkdirp(C.DATASOURCES_PATH)

const datasources = require('./getdatasource')

require('electron').ipcRenderer.on('quitting', () => {
  datasources.all().forEach(d => d.close())
})
