const fs = require('fs-extra')
const path = require('path')

const exists = require('path-exists').sync
const after = require('lodash/after')
const any = require('lodash/some')
const deepequal = require('lodash/isEqual')
const batchify = require('byte-stream')
const through = require('through2')
const pumpify = require('pumpify')

const datasource = require('../lib/getdatasource')
const C = require('../lib/constants')

const update = () => datasource.all().map(ds => ds.data())

// perform a one-time load of any datasource in the data directory
const loadOnce = (state, bus) => {
  const keys = fs.readdirSync(
    C.DATASOURCES_PATH
  ).filter(
    file => fs.statSync(path.join(C.DATASOURCES_PATH, file)).isDirectory()
  )
  const loaded = () => {
    state.datasources.loaded = true
    bus.emit('render')
  }
  if (keys.length > 0) {
    const datasources = []

    keys.forEach(key => bus.emit('datasources:add', { key: key }))
    loaded()
  } else {
    loaded()
  }
}

// poll for new stats
const pollForUpdates = (state, bus) => {
  setInterval(() => {
    const news = update()
    const anyfinished = any(news, ds => ds.stats.metadataSync.finished)
    if (anyfinished) {
      if (state.initialising) bus.emit('initialising:stop')
    } else {
      if (!state.initialising) bus.emit('initialising:start')
    }
    if (!deepequal(state.datasources.list, news)) {
      state.datasources.list = news
      bus.emit('render')
    }
  }, 1000)
}

module.exports = (state, bus) => {
  state.datasources = { shown: false, loaded: false, list: [] }

  const debug = msg => bus.emit('log:debug', '[model:datasources] ' + msg)

  let activesearches = []

  const cancelsearch = () => {
    if (activesearches.length > 0) {
      debug(`cancelling ${activesearches.length} active searches`)
      activesearches.forEach(resultstream => resultstream.destroy())
      activesearches = []
    }
  }

  const search = () => {
    cancelsearch()

    if (!state.datasources.list || state.datasources.list.length === 0) {
      throw new Error('No datasources found (they may not have loaded yet)')
    }

    const active = state.datasources.list.filter(
      ds => ds.active && !ds.loading
    )

    if (active.length === 0) return bus.emit('results:none', 'datasources')

    const query  = state.search.query.trim().replace(/et al\.?$/, '')

    const resultify = ds => {
      let count = 0

      const write = (list, _, cb) => {
        count += list.length

        bus.emit('results:receive', {
          hits: list.map(r => {
            r.source = ds.key
            return r
          })
        })

        cb()
      }

      const flush = cb => {
        if (count === 0) {
          bus.emit('results:none', ds.name)
        } else {
          bus.emit('results:count', { count: count, source: ds.name })
        }
        cb()
      }

      return through.obj(write, flush)
    }

    active.forEach(ds => datasource.fetch(ds.key, (err, source) => {
      if (err) throw err

      const resultstream = pumpify(
        source.db.search(query),
        batchify(30),
        resultify(source)
      )
      activesearches.push(resultstream)
    }))
  }

  bus.on('datasources:show', () => {
    state.datasources.shown = true
    bus.emit('render')
  })

  bus.on('datasources:toggle-shown', () => {
    state.datasources.shown = !state.datasources.shown
    bus.emit('render')
  })

  bus.on('datasources:add', source => {
    datasource.fetch(source.key, (err, ds) => {
      if (err) return bus.emit('error', err)
      // ds.relayEventsTo(bus, { namespace:'datasources' })
      if (source.active) ds.setActive()
      ds.connect()

      if (datasource.all().length > 1) {
        bus.emit('notification:add', {
          title: 'Datasource added',
          message: 'datasource added:\n' + source.name
        })
      }

      ds.on('connected', () => bus.emit('initialising:stop'))
      ds.on('progress', () => {
        if (state.initialising) bus.emit('render')
      })
    })
  })

  bus.on('datasources:toggle-active', key => {
    datasource.fetch(key, (err, source) => {
      if (err) return bus.emit('error', err)

      source.toggleActive()
      if (source.stats.get('active').value()) {
        source.syncMetadata(err => {
          if (err) return bus.emit('error', err)
        })
      }
    })
  })

  bus.on('datasources:search', search)
  bus.on('datasources:cancel-search', cancelsearch)

  bus.on('DOMContentLoaded', () => {
    loadOnce(state, bus)
    pollForUpdates(state, bus)
  })
}
