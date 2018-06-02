const html = require('choo/html')
const hexdata = require('../assets/hexes/data.json')
const hex = require('./hex')

const hexes = hexdata.map(hex)

module.exports = () => html`

  <div class="center w-80 mb8 h5">
    <div class="center" id="grid" style="position: relative;">${hexes}</div>
  </div>

`
