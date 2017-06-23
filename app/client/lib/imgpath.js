const path = require('path')
const win = require('os').platform() === 'win32'

const imgdir = path.join('.', 'images')

module.exports = img => path.join(imgdir, img)
