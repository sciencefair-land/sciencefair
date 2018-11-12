const choo = require('choo')
const grid = require('hex-grid')

const app = choo({ href: false, history: false })

app.use(hexgridder)
app.route('*', require('./components/home'))
app.mount('body')

function hexgridder (state, emitter) {
  emitter.on('DOMContentLoaded', () => {
    var hexes = [].slice.call(document.querySelectorAll('.hex'))
    var root = document.querySelector('#grid')

    function scan () {
      const spacing = 10
      const outerwidth = root.offsetWidth

      const g = grid({ element: root, spacing: spacing }, hexes)

      let innerwidth = (spacing * (g.grid.filter(d => d.y === 0).length - 1))
      g.grid.map((d, i) => {
        if (d.y === 0) innerwidth += hexes[i].offsetWidth
      })
      const leftpad = (outerwidth - innerwidth) / 2

      const hexheight = hexes[0].offsetHeight
      const heightpad = Math.max(g.grid.map(d => d.y)) + hexheight + 100

      root.style.height = `${heightpad}px`

      hexes.forEach((el, i) => {
        const pos = g.grid[i]
        el.style.top = `${pos.y}px`
        el.style.left = `${pos.x + leftpad}px`
      })
    }

    scan()
    window.addEventListener('load', scan)
    window.addEventListener('resize', scan)
  })
}
