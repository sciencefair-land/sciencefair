var inherits = require('inherits')
var _ = require('lodash')
var EventEmitter = require('events').EventEmitter
var readdir = require('recursive-readdir-sync')
var mkdirp = require('mkdirp')
var path = require('path')

inherits(Paper, EventEmitter)

function Paper (doc, opts) {
  if (!(this instanceof Paper)) return new Paper(doc, opts)
  var self = this

  if (_.isString(doc.document)) {
    doc.document = JSON.parse(doc.document)
  }
  self.doc = _.cloneDeep(doc.document)
  Object.assign(self, doc.document)

  self.identifier = self.doc.identifier.map((id) => {
    if (id.type === 'pmcid') {
      if (!(/^PMC/.test(id.id))) id.id = `PMC${id.id}`
    }
    return id
  })
  self.identifier = _.sortBy(self.identifier, 'type')
  self.identifier = _.uniqBy(self.identifier, 'type')

  self.assetDir = _.memoize(function () {
    var dir = opts.fulltextSource.dir
    var pmcid = self.getId('pmcid')
    return path.join(opts.datadir, dir, pmcid)
  })

  self.assetPaths = function () {
    mkdirp.sync(self.assetDir())
    var paths = readdir(self.assetDir())
    if (paths.length > 0) self.downloaded = true
    return paths
  }

  self.download = function (downloadfn, cb) {
    function done (a, b, c) {
      if (self.downloadsRunning === 0) cb(a, b, c)
    }
    downloadfn(self, done)
  }

  self.downloadsRunning = 0

  self.downloading = function (res, url, type) {
    // if we don't know the actual size of the file,
    // assume it's 1MB so the user sees some progress
    var total = parseInt(res.headers['content-length'], 10) || 100000

    self.downloadsRunning += 1
    var bytesReceived = 0

    self.emit('download.start', {
      type: type,
      url: url,
      response: res
    })

    res.on('data', function (data) {
      bytesReceived += data.length
      self.emit('download.data', {
        type: type,
        url: url,
        response: res,
        data: data,
        bytesReceived: bytesReceived
      })
    })

    res.on('error', function (err) {
      console.log(err)
      self.emit('download.error', {
        type: type,
        url: url,
        response: res,
        error: err
      })
    })

    res.on('end', function () {
      self.emit('download.end', {
        type: type,
        url: url,
        response: res,
        bytesReceived: bytesReceived
      })
    })
  }

  self.downloadFinished = function (a, b, c) {
    self.downloadsRunning -= 1
    self.emit('download.finished', a, b, c)
  }

  self.getId = _.memoize(function (type) {
    if (!type) {
      return self.getId('pmcid') || self.getId('pmid') || self.getId('doi')
    }
    var hit = _.find(self.identifier, { type: type })
    return hit ? hit.id : null
  })

  self.stringForAuthor = function (author) {
    return `${author.surname}`
  }

  self.etalia = _.memoize(function () {
    var authorStrs = self.author.map(self.stringForAuthor)
    if (self.author.length > 3) {
      return self.stringForAuthor(self.author[0]) + ' et al.'
    } else if (self.author.length === 2) {
      return authorStrs.join(' & ')
    } else {
      return authorStrs.join(', ')
    }
  })

  self.assetUrl = function (assetPath) {
    var port = opts.contentServer.port
    var dir = opts.fulltextSource.dir
    var pmcid = self.getId('pmcid')
    var url = `http://localhost:${port}/${dir}/${pmcid}/${assetPath}`
    console.log('paper should be served at', url)
    return url
  }

  self.serialize = function () {
    return self.doc
  }
}

module.exports = Paper
