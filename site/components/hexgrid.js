const html = require('choo/html')
const grid = require('hex-grid')
const hexdata = require('../assets/hexes/data.json')
const hex = require('./hex')

const hexes = hexdata.map(hex)

const root = html`

  <div id="hexgrid">
    ${hexes}
  </div>

`

var g
function scan () {
  g = grid({ element: root, spacing: 4 }, hexes)
}

function gethexes () {

}

var prev
root.addEventListener('mousemove', function (ev) {
    var h = g.lookup(ev.pageX, ev.pageY)
    if (!h) return
    if (prev) prev.style.opacity = 0.5
    h.style.opacity = 1
    prev = h
});
