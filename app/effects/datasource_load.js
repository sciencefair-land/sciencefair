const datasource = require('../../lib/datasource')
const after = require('lodash/after')
const path = require('path')
const fs = require('fs')

module.exports = (data, state, send, done) => {
  const alldone = after(2, done)

  const source = datasource(data.key)

  source.connect((err, db) => {
    if (err) done(err)

    // collect datasource metadata
    let count = 0

    const itemstream = source.archive.list((err, entries) => {
      if (err) {
        console.log('error in item stream', err)
        done(err)
      } else {
        console.log('reached end of item stream, got', count, 'items')
        send('datasource_update', {
          key: data.key, size: count, loading: false
        }, alldone)
      }
    })

    itemstream.on('data', entry => {
      if (entry.type === 'file' && entry.name === 'sciencefair.json') {
        source.archive.download(entry, err => {
          if (err) {
            console.log('error downloading sciencefair.json ')
            alldone(err)
          } else {
            const info = JSON.parse(
              fs.readFileSync(path.join(source.datadir, entry.name))
            )
            const updatesource = {
              key: data.key,
              source: source
            }
            Object.assign(updatesource, info)
            send('datasource_update', updatesource, alldone)
          }
        })
      } else if (/^meta.*json$/.test(entry.name)) {
        // metadata for an article
        count += 1
      }
    })
  })
}
