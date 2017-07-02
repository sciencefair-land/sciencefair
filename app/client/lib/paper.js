const path = require('path')
const fs = require('fs-extra')
const uniq = require('lodash/uniq')

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
    self.title = htmlify(data.title || 'no title')
    self.author = data.author || 'unknown'
    self.abstract = htmlify(data.abstract || 'no abstract given')
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
    self.entryfile = data.entryfile
    if (!self.entryfile) {
      throw new Error('Paper requires an entryfile', data)
    }
    self.path = path.join('/articles', data.path.split('').join('/'))
    self.files = uniq((data.files || []).concat([data.entryfile])).map(
      file => path.join(self.path, file)
    )
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
    if (self.downloading) return cb(null, self.progress)
    if (self.progress === 100) return cb(null, self.progress)
    if (self.progresschecked) return cb(null, self.progress)
    if (!(self.ds && self.ds.articles && self.ds.articles.content)) {
      // datasource not ready to check progress, try again after delay
      return setTimeout(() => self.filesPresent(cb), 500)
    }
    self.ds.articlestats(self.files, (err, stats) => {
      if (err) return cb(err)
      debug('progress stats', self.title, stats)
      if (stats.progress > 0) self.collected = true
      self.progress = stats.progress * 100
      self.progresschecked = true
      cb(null, self.progress, true)
    })
  }

  self.candownload = () => self.ds.ready()

  self.download = () => {
    debug('downloading', self.key)
    if (self.downloading) return null
    self.collected = true
    self.downloading = true
    const download = self.ds.download(self)
    if (!download) return null

    const done = () => {
      if (!self.downloading) return
      debug('downloaded', self.key)
      self.downloading = false
      self.progresschecked = true
    }

    download.on('progress', data => {
      self.progress = data.progress * 100
      if (self.progress === 100) done()
    })

    download.on('error', err => {
      self.downloading = false
      debug('error downloading paper: ', self.key)
      throw err
    })

    download.on('end', done)

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
      key: self.key,
      identifier: self.identifiers,
      path: data.path,
      files: data.files,
      entryfile: self.entryfile
    }
  }

  self.removeFiles = cb => {
    const done = err => {
      if (err) return cb(err)
      self.progress = 0
      self.downloading = false
      self.progresschecked = true
      cb()
    }

    self.ds.clear(self.files, done)
  }

  self.loadData()
}

function htmlify (str) {
  return str.replace('<italic>', '<em>').replace('</italic>', '</em>')
}

module.exports = Paper
