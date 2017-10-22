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


const datasources = require('./getdatasource')

window.require('electron').ipcRenderer.on('quitting', () => {
  datasources.all().forEach(d => d.close(() => {}))
})
