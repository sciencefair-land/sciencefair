const path = require('path')
const fs = require('fs-extra')

const C = require('./constants')
const debug = require('debug')('sciencefair:paper')

function Paper (data) {
  if (data instanceof Paper) return data
  if (!(this instanceof Paper)) return new Paper(data)

  if (data.document) {
    Object.assign(data, data.document)
    delete data.document
  }

  const self = this
  self.progress = 0

  self.loadData = () => {
    self.loadBib()
    self.loadSearchResult()
  }

  self.loadBib = () => {
    self.title = data.title || 'no title'
    self.author = data.author || 'unknown'
    self.abstract = data.abstract || 'no abstract given'
    self.date = data.date || { year: 'unknown ', month: 'unknown', day: 'unknown'}
    self.tags = data.tags || []
    self.identifiers = data.identifier || []
    self.source = data.source
    if (!self.source) {
      throw new Error('Paper requires a source:', data)
    }
    self.loadDatasource()
    self.loadID()
  }

  self.loadDatasource = () => {
    // TODO: remove this path hack once hyperdrive is optimised,
    // else have sciencefair datasource generator handle it
    self.path = path.join('/articles', data.path.split('').join('/'))
    self.files = data.files.map(file => path.join(self.path, file))
    self.entryfile = data.entryfile
    require('./getdatasource').fetch(self.source, (err, ds) => {
      if (err)  return cb(err)
      self.ds = ds
    })
  }

  self.loadSearchResult = () => {
    if (data.score) self.score = data.score
  }

  self.loadID = () => {
    // if (data.key) self.key = data.key
    var doi = self.identifiers.find(id => id.type.toLowerCase() === 'doi')
    self.id = doi ? doi.id : self.identifiers[0].id
    self.key = `${self.source}:${self.id}`
  }

  self.filesPresent = cb => {
    if (self.ds && self.ds.articles && self.ds.articles.content) {
      if (self.progress === 1) return cb(null, 1)
      if (self.downloading) return cb(null, self.progress)
      return self.ds.articlestats(self.files, (err, stats) => {
        if (err) return cb(err)
        self.stats = stats
        self.progress = stats.progress * 100
        cb(null, self.progress)
      })
    } else {
      // datasource not ready to check progress, try again after delay
      return setTimeout(() => self.filesPresent(cb), 500)
    }
  }

  self.candownload = () => self.ds.ready()

  self.download = () => {
    debug('downloading', self.key)
    if (self.downloading) return null
    self.downloading = true
    const download = self.ds.download(self)
    if (!download) return null

    download.on('progress', data => {
      self.progress = data.progress * 100
    })

    download.on('error', err => {
      self.downloading = false
      console.error('error downloading paper: ', self.key)
      throw err
    })

    download.on('end', () => {
      self.downloading = false
    })

    return download
  }

  self.metadata = () => {
    return {
      title: self.title,
      author: self.author,
      authorstr: self.author.map(a => `${a['given-names']} ${a.surname}`).join(' '),
      date: self.date,
      abstract: self.abstract,
      tags: self.tags,
      source: self.source,
      id: self.id,
      identifier: self.identifiers,
      path: self.path,
      files: self.files,
      entryfile: self.entryfile
    }
  }

  self.removeFiles = cb => {
    self.getArticleEntries((err, entries) => {
      if (err) return cb(err)
      entries.filter(
        entry => entry.type === 'directory'
      ).forEach(
        entry => fs.emptyDirSync(path.join(self.ds.datadir, entry.name))
      )

      cb()
    })
  }

  self.loadData()
}

module.exports = Paper
