const intersection = require('lodash/intersection')
const uniq = require('lodash/uniq')
const debounce = require('lodash/debounce')
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

module.exports = (state, bus) => {
  state.collectioncount = 0
  state.collection = null
  let restartchecked = false

  const debug = msg => bus.emit('log:debug', '[model:collection] ' + msg)

  let activescan

  const _activeScanDestroyedError = err => {
    return err.message === 'premature close'
  }

  const _scan = name => {
    const tags = {}
    let count = 0

    if (activescan) return setTimeout(scan, 1000)

    activescan = state.collection.docstore.createReadStream().on(
      'data', data => {
        count += 1
        const doc = parsedoc(data.value)
        if (!doc.tags) return
        doc.tags.forEach(tag => {
          tags[tag] = uniq((tags[tag] || []).concat(data.key))
        })
      }
    )

    eos(activescan, err => {
      activescan = null
      if (err && !_activeScanDestroyedError(err)) {
        throw err
      } else if (!err) {
        state.collectioncount = count
        bus.emit('tags:replace', tags)
        if (!restartchecked) {
          bus.emit('downloads:restart')
          restartchecked = true
        }
        bus.emit('renderer:render')
      }
    })
  }

  const scan = debounce(_scan, 300, { leading: true, trailing: true })

  require('../lib/localcollection')((err, db) => {
    if (err) throw err
    state.collection = db
    scan('initial')
  })

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
      'error', err => { throw err }
    ).on(
      'end', () => {
        bus.emit('results:receive', { hits: hits })
        bus.emit('results:count', { count: hits.length, source: 'collection' })
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
        bus.emit('results:count', { count: count, source: 'collection' })
        cb()
      }

      return through.obj(write, flush)
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
      'error', err => { throw err }
    ).on(
      'end', () => {
        bus.emit('results:receive', { hits: hits })
        bus.emit('results:count', { count: hits.length, source: 'collection' })
      }
    )

    activesearches.push(stream)
  }

  const dosearch = () => {
    if (!state.collection) return
    const query = state.search.query
    const tags = state.search.tags

    if (query && query.trim() === '*' && tags.length === 0) {
      all()
    } else if (query && query.trim() !== '*' && query.trim().length > 0) {
      search(query, tags)
    } else if (tags && tags.length) {
      filter(tags)
    }
  }

  const addorupdatepaper = (data, update) => {
    const papers = isArray(data) ? data : [data]
    const docs = stream(papers)

    const index = state.collection

    const metadataify = through.obj(
      (paper, enc, next) => next(null, paper.metadata())
    )

    const maybescan = err => {
      if (err) throw err
      scan(update ? 'update' : 'add')
    }

    const op = cb => update ? index.update(cb) : index.add(cb)
    pumpify(docs, metadataify, op(maybescan))
  }

  const updatepaper = data => {
    const papers = isArray(data) ? data : [data]
    const oldp = []
    const newp = []
    papers.forEach(p => p.minprogress() > 0 ? oldp.push(p) : newp.push(p))
    if (oldp.length > 0) addorupdatepaper(oldp, true)
    if (newp.length > 0) addorupdatepaper(newp, false)
  }

  const removepaper = data => {
    if (typeof data === 'string') data = [data]

    const n = data.length

    const removefromdb = afterall(n, err => {
      if (err) throw err

      state.collection.del(data.map(d => d.key), err => {
        if (err) throw err

        bus.emit('notification:add', {
          title: `Paper${n === 1 ? '' : 's'} deleted`,
          message: `${n} paper${n === 1 ? '' : 's'} ha${n === 1 ? 's' : 've'} been removed from the local collection`
        })

        data.forEach(d => bus.emit('results:remove', d))
        bus.emit('selection:clear')
        bus.emit('detail:toggle')
        scan('remove')
      })
    })

    data.forEach(paper => paper.removeFiles(err => {
      if (err) throw err
      removefromdb()
    }))
  }

  bus.on('collection:search', dosearch)
  bus.on('collection:cancel-search', cancelsearch)

  bus.on('collection:update-paper', updatepaper)
  bus.on('collection:remove-paper', removepaper)

  bus.on('DOMContentLoaded', () => {})
}
