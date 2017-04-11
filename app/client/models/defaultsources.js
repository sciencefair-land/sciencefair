// this loads the default datasets once each,
// if they aren't already added

const path = require('path')
const C = require('../lib/constants.js')
const exists = require('path-exists').sync

const defaults = [
  'd46701afd5da330f8ddcd106787cbf9def1134ecae46b38cce46afddd8e770ef' //elife
]

module.exports = (state, bus) => {
  bus.on('DOMContentLoaded', () => {
    defaults.forEach(key => {
      const dir = path.join(C.DATASOURCES_PATH, key)

      if (exists(dir)) return
      else bus.emit('datasources:add', { key: key, active: true })
    })
  })
}
