const intersection = require('lodash/intersection')
const diff = require('lodash/difference')
const uniq = require('lodash/uniq')
const isArray = require('lodash/isArray')
const batchify = require('byte-stream')
const through = require('through2')
const pumpify = require('pumpify')
const stream = require('stream-from-array').obj
const eos = require('end-of-stream')
const afterall = require('../lib/alldone')

const parsedoc = doc => (typeof doc === 'string') ? JSON.parse(doc) : doc

const parseresults = results => {
  results = results.map(hit => {
    hit.document = parsedoc(hit.document)
    if (!hit.document.tags) hit.document.tags = []
    hit.collected = true
    hit.source = hit.document.source
    return hit
  })
  return { hits: results }
}

const throwerr = err => { throw err }

module.exports = (state, bus) => {
  state.collectioncount = 0
  state.collection = null

  const debug = msg => bus.emit('log:debug', '[model:collection] ' + msg)

  const scan = () => {
    const tags = {}
    var count = 0
    state.collection.docstore.createReadStream().on(
      'data', data => {
        const doc = parsedoc(data.value)
        count += 1
        if (!doc.tags) return
        doc.tags.forEach((tag) => {
          tags[tag] = uniq((tags[tag] || []).concat(data.key))
        })
      }
    ).on(
      'error', throwerr
    ).on(
      'end', () => {
        state.collectioncount = count
        bus.emit('tags:replace', tags)
      }
    )
  }

  require('../lib/localcollection')((err, db) => {
    if (err) throw err
    state.collection = db
    scan()
  })

  const remove = data => {
    if (typeof data === 'string') data = [data]

    data.forEach(paper => paper.unsync())

    state.collection.del(data.map(d => d.key), err => {
      if (err) throw err

      const n = data.length
      bus.emit('note_add', {
        title: 'Papers deleted',
        message: `${n} ${n === 1 ? '' : 's'} ha${n === 1 ? 's' : 've'} been removed from the local collection`
      }, done)
    })

    bus.emit('results:replace', diff(state.results, data))
    bus.emit('selection:clear')
    bus.emit('detail:toggle')
    scan()
  }

  let activesearches = []

  const cancelsearch = () => {
    if (activesearches.length > 0) {
      debug(`cancelling ${activesearches.length} active searches`)
      activesearches.forEach(resultstream => resultstream.destroy())
      activesearches = []
    }
  }

  const all = () => {
    cancelsearch()
    const docstore = state.collection.docstore
    const hits = []
    const stream = docstore.createReadStream().on(
      'data', entry => {
        const doc = parsedoc(entry.value)
        hits.push(doc)
      }
    ).on(
      'error', throwerr
    ).on(
      'end', () => {
        if (hits.length > 0) {
          bus.emit('results:receive', {
            hits: hits
          }, done)
        } else {
          bus.emit('results:none', 'collection')
        }
      }
    )
    activesearches.push(stream)
  }

  const search = (query, tags) => {
    cancelsearch()
    const cleanquery = query.replace('*', '').trim().replace(/et al\.?$/, '')

    const resultify = () => {
      let count = 0

      const write = (list, _, cb) => {
        count += list.length

        if (tags && tags.length > 0) {
          // filter by tags
          list = list.filter(hit => {
            const doc = parsedoc(hit.document)
            const overlap = intersection(doc.tags, tags)
            return overlap.length === tags.length
          })
        }

        bus.emit('results:receive', parseresults(list))

        cb()
      }

      const flush = cb => {
        if (count === 0) {
          bus.emit('results:none', 'collection')
        } else {
          bus.emit('results:count', { count: count, source: 'collection'})
        }
        cb()
      }

      return through(write, flush)
    }

    const stream = pumpify(
      state.collection.search(cleanquery),
      batchify(30),
      resultify()
    )
    activesearches.push(stream)
  }

  const filter = tags => {
    cancelsearch()
    const docstore = state.collection.docstore
    const hits = []

    const stream = docstore.createReadStream().on(
      'data', entry => {
        const doc = parsedoc(entry.value)
        const overlap = intersection(doc.tags, tags)
        if (overlap.length === tags.length) hits.push(doc)
      }
    ).on(
      'error', throwerr
    ).on(
      'end', () => {
        if (hits.length > 0) {
          bus.emit('results:receive', { hits: hits })
        } else {
          bus.emit('results:none', 'collection')
        }
      }
    )

    activesearches.push(stream)
  }

  const dosearch = () => {
    if (!state.collection) return
    const query = state.search.query
    const tags = state.search.tags

    if (query.trim() === '*') {
      all()
    } else if (query && query.trim().length > 0) {
      search(query, tags)
    } else if (tags && tags.length) {
      filter(tags)
    }
  }

  const updatepaper = data => {
    const papers = isArray(data) ? data : [data]
    const docs = stream(papers)
    const keys = papers.filter(p => !p.collected).map(p => p.key)

    const index = state.collection

    const metadataify = through.obj({ objectMode: true }, (paper, enc, next) => {
      next(null, paper.metadata())
    })

    index.del(keys, err => {
      if (err) throw err
      eos(pumpify(docs, metadataify, index.add(err => {
        if (err) throw err
      })), err => {
        if (err) throw err
        scan()
      })
    })
  }

  const removepaper = data => {
    if (typeof data === 'string') data = [data]

    const removefromdb = afterall(data.length, () => {
      state.collection.del(data.map(d => d.key), err => {
        if (err) return done(err)

        const n = data.length
        send('note_add', {
          title: 'Papers deleted',
          message: `${n} ${n === 1 ? '' : 's'} ha${n === 1 ? 's' : 've'} been removed from the local collection`
        }, done)
      })
    })

    data.forEach(paper => paper.removeFiles(removefromdb))
  }

  bus.on('collection:search', dosearch)
  bus.on('collection:cancel-search', cancelsearch)

  bus.on('collection:updatepaper', updatepaper)
  bus.on('collection:removepaper', removepaper)

  bus.on('DOMContentLoaded', () => {})
}

const noop = () => {}
