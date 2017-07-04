// this loads the default datasets once each,
// if they aren't already added

const path = require('path')
const C = require('../../constants')
const exists = require('path-exists').sync

const defaults = [
  'ce62c46f51f1e50fbf9da718540003b47ffce5f19279162ce975a7d0aca164de' //elife
  // '129a96d556e77a47fbccfbb8914379ca7e81add926efd4bea384c01e9f42a6e6'
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
