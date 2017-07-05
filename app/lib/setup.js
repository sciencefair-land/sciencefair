const C = require('../constants')
const mkdirp = require('mkdirp').sync

mkdirp(C.DATAROOT)
mkdirp(C.COLLECTION_PATH)
mkdirp(C.DATASOURCES_PATH)


