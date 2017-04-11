const path = require('path')
const fs = require('fs-extra')

const C = require('./constants')

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
    self.path = data.path.split('').join('/')
    self.files = data.files
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
    // if (self.ds && self.ds.articles && self.ds.articles.content) {
    //   if (self.progress === 1) return cb(null, 1)
    //   return self.getArticleEntries((err, entries) => {
    //     if (err) return cb(err)
    //     self.progress = self.ds.entrysetDownloadProgress(entries)
    //     cb(null, self.progress)
    //   })
    // } else {
    //   // datasource not ready to check progress, try again after delay
    //   return setTimeout(() => self.filesPresent(cb), 500)
    // }
  }

  self.download = cb => self.ds.download(self, cb)

  self.getArticleEntries = cb => {
    if (self.entries) return cb(null, self.entries)
    self.ds.getArticleEntries(self, (err, entries) => {
      if (err) return cb(err)
      self.entries = entries
      return cb(null, entries)
    })
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
