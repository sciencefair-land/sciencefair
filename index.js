const platform = require('platform')

const os = platform.os

let dltxt = ''

if (os.test(/^Windows/)) {
  dltxt = ' for Windows'
} else if (os.test(/^Mac OS/)) {
  dltxt = ' for Mac'
} else if (os.text(/^Linux/)) {
  dltxt = ' for Linux'
}

const button = document.getElementById('cta-download').innerHTML += dltxt
const buttontxt = document.querySelector('#cta-download > span')
