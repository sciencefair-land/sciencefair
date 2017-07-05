const path = require('path')

const app = require('electron').app
const remote = require('electron').remote
const api = app || remote.app

const DEVMODE = !!(process.env['SCIENCEFAIR_DEVMODE'])

const docs = api.getPath('documents')
const dataroot = path.join(docs, DEVMODE ? 'sciencefair_dev' : 'sciencefair')

module.exports = {
  // paths
  DATAROOT: dataroot,
  DATASOURCES_PATH: path.join(dataroot, 'datasources'),
  COLLECTION_PATH: path.join(dataroot, 'collection'),
  // colours
  BLUE: 'rgb(111, 174, 193)',
  YELLOW: 'rgb(202, 172, 77)',
  YELLOWFADE: 'rgba(202, 172, 77, 0.8)',
  MIDBLUE: 'rgb(43, 43, 51)',
  MIDBLUEFADE: 'rgba(43, 43, 51, 0.8)',
  DARKBLUE: 'rgb(33, 33, 39)',
  LIGHTGREY: 'rgb(178 ,180, 184)',
  GREYBLUE: 'rgb(55, 63, 72)',
  WHITE: 'rgb(17, 17, 19)',
  ERROR: '#ff4500',
  // autocomplete
  AUTOMAXTAGS: 20
}
