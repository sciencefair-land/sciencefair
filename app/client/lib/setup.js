if (process.env.SCIENCEFAIR_DEVMODE) {
  // localStorage.setItem('debug', process.env.DEBUG)
  localStorage.setItem('logLevel','debug')
  require('debug-menu').install()
}
const C = require('./constants')
const mkdirp = require('mkdirp').sync

mkdirp(C.DATAROOT)
mkdirp(C.COLLECTION_PATH)
mkdirp(C.DATASOURCES_PATH)

require('electron').ipcRenderer.on('quitting', () => {
  console.log('APP QUITTING')
  require('./lib/getdatasource').all().forEach(d => d.close())
})
