const any = require('lodash/some')
const deepequal = require('lodash/isEqual')
const batchify = require('byte-stream')
const through = require('through2')
const pumpify = require('pumpify')

const datasource = require('../lib/getdatasource')

const { ipcRenderer } = require('electron')

// perform a one-time load of any datasource in the data directory
const loadOnce = (state, bus) => {
  const loaded = () => {
    state.datasources.loaded = true
    bus.emit('renderer:render')
  }

  ipcRenderer.send('datasources:updateKeys')

  ipcRenderer.on('datasources:keysUpdated', (event, keys) => {
    if (keys.length > 0) {
      keys.forEach(key => bus.emit('datasources:add', { key: key }))
      loaded()
    } else {
      loaded()
    }
  })
}

module.exports = (state, bus) => {
  state.datasources = { shown: false, loaded: false, list: [] }

  const debug = msg => bus.emit('log:debug', '[model:datasources] ' + msg)
  const render = () => bus.emit('renderer:render')

  const list = () => state.datasources.list
  const setlist = _list => {
    state.datasources.list = _list
  }

  const shown = () => state.datasources.shown

  const setshown = _shown => {
    state.datasources.shown = _shown
  }

  const add = source => {
    const addfail = msg => bus.emit('notification:add', {
      title: 'Datasource could not be added',
      message: msg
    })

    if (source.key.length !== 64) return addfail('key must be 64 characters')

    datasource.fetch(source.key, (err, ds) => {
      if (err) return addfail(err.message)
      if (source.active) ds.setActive()

      ds.connect()

      if (datasource.all().length > 1) {
        bus.emit('notification:add', {
          title: 'Datasource added',
          message: 'datasource added:\n' + ds.name
        })
      }

      ds.on('connected', () => {
        if (state.initialising) bus.emit('initialising:stop')
      })
      ds.on('progress', () => { if (state.initialising) render() })
    })
  }

  const remove = source => {
    datasource.fetch(source, (err, ds) => {
      if (err) throw err

      datasource.del(source)

      bus.emit('notification:add', {
        title: 'Datasource removed',
        message: 'datasource removed:\n' + ds.name
      })
    })
  }

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

    const active = state.datasources.list.filter(ds => ds.active && !ds.loading)

    if (active.length === 0) return bus.emit('results:none', 'datasources')

    if (!state.search.query) return bus.emit('results:none', 'datasources')

    let query = state.search.query.trim().replace(/et al\.?$/, '')

    const resultify = ds => {
      let count = 0

      const write = (hits, _, cb) => {
        count += hits.length

        hits.forEach(r => {
          r.source = ds.key
        })
        bus.emit('results:receive', { hits: hits })

        cb()
      }

      const flush = cb => {
        if (count === 0) bus.emit('results:receive', { hits: [] })
        bus.emit('results:count', { count: count, source: ds.name })
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

  const show = () => {
    setshown(true)
    render()
  }

  const toggleShown = () => {
    setshown(!shown())
    render()
  }

  const toggleActive = key => {
    datasource.fetch(key, (err, source) => {
      if (err) return bus.emit('error', err)

      source.toggleActive()
      if (source.stats.get('active').value()) {
        source.maybeSyncMetadata(err => {
          if (err) return bus.emit('error', err)
        })
      }
    })
  }

  const init = () => {
    loadOnce(state, bus)
    poll()
  }

  const poll = () => {
    const sources = datasource.all()
    const news = sources.map(ds => ds.data())

    // update initialising
    const any10pc = any(news, ds => {
      const d = ds.stats.metadataSync
      return d.finished
    })
    if (any10pc) {
      if (state.initialising) bus.emit('initialising:stop')
    } else {
      if (!state.initialising) bus.emit('initialising:start')
    }

    // update list
    if (!deepequal(list(), news)) {
      setlist(news)
      if (shown()) render()
    }
  }

  setInterval(poll, 1000)

  bus.on('datasources:add', add)
  bus.on('datasources:remove', remove)
  bus.on('datasources:search', search)
  bus.on('datasources:cancel-search', cancelsearch)
  bus.on('datasources:show', show)
  bus.on('datasources:toggle-shown', toggleShown)
  bus.on('datasources:toggle-active', toggleActive)

  bus.on('DOMContentLoaded', init)
}
