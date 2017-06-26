const html = require('choo/html')
const dlbtn = require('./dlbtn')

const version = require('../../package.json').version
const base = 'https://github.com/codeforscience/sciencefair/releases/download/'

const url = file => [base, `v${version}`, file].join('/')

const downloads = {
  macos: {
    href: url(`scienceFair-${version}.dmg`),
    content: html`<div><strong>macOS 10.11+</strong><br><br>DMG</div>`
  },
  win: {
    href: url(`sciencefair-setup-${version}.exe`),
    content: html`<div><strong>Windows 32 or 64 bit</strong><br><br>EXE</div>`
  },
  linuxdeb: {
    href: url(`ScienceFair-linux-amd64-${version}.deb`),
    content: html`<div><strong>Linux Debian / Ubuntu</strong><br><br>DEB</div>`
  },
  linuxrpm: {
    href: url(`ScienceFair-linux-x86_64-${version}.rpm`),
    content: html`<div><strong>Linux Fedora / SUSE</strong><br><br>RPM</div>`
  }
}

module.exports = () => html`

<div class="w-80 mv4 center">
  <div class="cf">
    ${Object.keys(downloads).map(system => dlbtn(downloads[system]))}
  </div>
</div>

`
