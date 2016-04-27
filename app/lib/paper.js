var inherits = require('inherits')
var _ = require('lodash')
var EventEmitter = require('events').EventEmitter
var reader = require('./reader.js')
var readdir = require('recursive-readdir-sync')
var mkdirp = require('mkdirp')

inherits(Paper, EventEmitter)

function Paper (doc, opts) {
  if (!(this instanceof Paper)) return new Paper(doc, opts)
  var self = this

  Object.assign(this, doc.document)

  self.identifier = self.identifier.map((id) => {
    if (id.type === 'pmcid') {
      if (!(/^PMC/.test(id.id))) id.id = `PMC${id.id}`
    }
    return id
  })

  self.assetDir = _.memoize(function () {
    var dir = opts.fulltextSource.dir
    var pmcid = self.getId('pmcid')
    return path.join(opts.datadir, dir, pmcid)
  })

  self.assetPaths = function() {
    mkdirp.sync(self.assetDir())
    var paths = readdir(self.assetDir())
    if (paths.length > 0) self.downloaded = true
    return paths
  }

  self.downloading = function (res, url, type) {
    // if we don't know the actual size of the file,
    // assume it's 1MB so the user sees some progress
    var total = parseInt(res.headers['content-length'], 10) || 100000
    var done = 0

    self.emit('download.start', {
      type: type,
      url: url,
      response: res
    })

    res.on('data', function (data) {
      done += data.length
      self.emit('download.data', {
        type: type,
        url: url,
        response: res,
        data: data
      })
    })

    res.on('error', function (err) {
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
        response: res
      })
    })
  }

  self.getId = _.memoize(function (type) {
    var hit = _.find(self.identifier, { type: type })
    return hit ? hit.id : null
  })

  self.stringForAuthor = function(author) {
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

  self.assetUrl = function(assetPath) {
    var port = opts.contentServer.port
    var dir = opts.fulltextSource.dir
    var pmcid = self.pmcid
    var url = `http://localhost:${port}/${dir}/${pmcid}/${assetPath}`
    console.log('paper should be served at', url)
    return url
  }
}

module.exports = Paper
