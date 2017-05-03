const path = require('path')

const imgdir = path.join(__dirname, '..', 'images')

module.exports = img => path.join(imgdir, img)
