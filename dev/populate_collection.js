const res = require('./cats.json')

const local = require('./lib/localcollection')

setTimeout(run, 500)

function run () {
  local.index.add(res, {
    batchName: 'dev_items',
    fieldOptions: [
      { fieldName: 'date', searchable: 'false' }
    ]
  }, (err) => {
    if (err) throw err
    console.log('added dev items to collection')
    local.index.close((err) => {
      if (err) {
        console.log(err)
      } else {
        console.log('closed collection')
      }
    })
  })
}
