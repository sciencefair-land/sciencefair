const untildify = require('untildify')
const path = require('path')

const DEVMODE = !!(process.env['SCIENCEFAIR_DEVMODE'])

const dataroot = untildify(DEVMODE ? '~/.sciencefair_dev' : '~/.sciencefair')

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
  DARKBLUE: 'rgb(33, 33, 39)',
  LIGHTGREY: 'rgb(178 ,180, 184)',
  GREYBLUE: 'rgb(55, 63, 72)',
  WHITE: 'rgb(17, 17, 19)',
  // autocomplete
  AUTOMAXTAGS: 20
}
