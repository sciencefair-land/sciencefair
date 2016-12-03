const path = require('path')
const fs = require('fs-extra')

const C = require('./constants')

function Paper (data) {
  if (data instanceof Paper) return data
  if (!(this instanceof Paper)) return new Paper(data)

  const self = this
  self.progress = 0

  self.loadData = () => {
    self.loadBib()
    self.loadSearchResult()
  }

  self.loadBib = () => {
    self.title = data.title || data.document.title
    self.author = data.author || data.document.author
    self.abstract = data.abstract || data.document.abstract
    self.date = data.date || data.document.date
    self.tags = data.tags || data.document ? data.document.tags || [] : []
    self.identifiers = data.identifier || data.document.identifier
    self.source = data.source
    if (!self.source) {
      throw new Error('Paper requires a source:', data)
    }
    self.loadDatasource()
    self.loadID()
  }

  self.loadDatasource = () => {
    self.path = data.path || data.document.path
    self.entryfile = data.entryfile || data.document.entryfile
    require('./getdatasource').fetch(self.source, (err, ds) => {
      if (err)  return cb(err)
      self.ds = ds
    })
  }

  self.loadSearchResult = () => {
    if (data.score) self.score = data.score
  }

  self.loadID = () => {
    if (data.key) self.key = data.key
    var doi = self.identifiers.find(id => id.type.toLowerCase() === 'doi')
    self.id = doi ? doi.id : self.identifiers[0].id
    self.key = `${self.source}:${self.id}`
  }

  self.filesPresent = cb => {
    if (self.progress === 1) return cb(null, 1)
    self.getArticleEntries((err, entries) => {
      if (err) return cb(err)
      self.progress = self.ds.entrysetDownloadProgress(entries)
      cb(null, self.progress)
    })
  }

  self.download = cb => self.ds.download(self, cb)

  self.getArticleEntries = cb => {
    if (self.entries) return cb(self.entries)
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
      date: self.date,
      abstract: self.abstract,
      tags: self.tags,
      source: self.source,
      id: self.id,
      identifier: self.identifiers,
      path: self.path,
      entryfile: self.entryfile
    }
  }

  self.loadData()

}

module.exports = Paper
