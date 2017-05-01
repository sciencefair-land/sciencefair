var events = require('events')
var readprogress = require('fs-readstream-progress')
var multi = require('multi-read-stream')
var inherits = require('inherits')

const debug = require('debug')('sciencefair:readstreams')

function ReadStreamsProgress (files, opts) {
  if (!(this instanceof ReadStreamsProgress)) return new ReadStreamsProgress(files, opts)
  events.EventEmitter.call(this)

  files = files.slice(0, 1)

  debug('progress streams for ' + files.length + ' files')

  if (!opts) opts = {}
  fs = opts.fs || require('fs')

  var self = this

  self.entries = []

  self.total = 0

  self.stream = multi(files.map(function (file) {
    return readprogress(file, opts)
      .once('total', addtotal)
      .on('progress', updateone(file))
      .on('error', error)
  }))

  self.stream.on('end', () => self.emit('end'))

  function addtotal (total) {
    debug('added total', total)
    self.total += total
  }

  function updateone (file) {
    var entry = { file: file, done: 0 }
    self.entries.push(entry)
    return function (data) {
      entry.done = data.done
      update()
    }
  }

  function update () {
    var done = 0
    self.entries.forEach(function (entry) { done += entry.done })

    var progress = done / self.total

    self.emit('progress', {
      done: done,
      total: self.total,
      progress: progress
    })
  }

  function error (err) { self.emit('error', err) }
}

// drains the readfile stream
ReadStreamsProgress.prototype.drain = function () {
  this.stream.on('data', noop)
}

inherits(ReadStreamsProgress, events.EventEmitter)

function noop () {}

module.exports = ReadStreamsProgress
