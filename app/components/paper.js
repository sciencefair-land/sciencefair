var css = require('dom-css')
var inherits = require('inherits')
var _ = require('lodash')
var EventEmitter = require('events').EventEmitter
var reader = require('./reader.js')

inherits(Paper, EventEmitter)

function Paper (container, opts) {
  if (!(this instanceof Paper)) return new Paper(container, opts)
  var self = this
  this.opts = opts

  var box = container.appendChild(document.createElement('div'))
  box.className = 'paper'
  var title = box.appendChild(document.createElement('div'))
  var author = box.appendChild(document.createElement('div'))
  var year = box.appendChild(document.createElement('div'))
  var overlay = box.appendChild(document.createElement('div'))
  var lens = overlay.appendChild(document.createElement('img'))
  var bar = box.appendChild(document.createElement('div'))
  lens.src = './images/lens.png'

  var lensReader = null

  var base = {
    position: 'absolute',
    fontFamily: 'Aleo-Regular',
    textAlign: 'left',
    color: 'rgb(178,180,184)'
  }

  css(box, {
    position: 'relative',
    background: 'rgb(43,43,51)',
    display: 'inline-block',
    marginRight: '20px',
    marginBottom: '20px',
    cursor: 'pointer'
  })

  css(bar, {
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 999,
    width: '0%',
    height: 7,
    display: 'block',
    backgroundColor: 'rgb(202, 172, 77)'
  })

  css(overlay, {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    display: 'none',
    background: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center'
  })

  css(lens, {
    width: '20%'
  })

  self.layout = function () {

    var width = '160'

    css(box, {
      width: width + 'px',
      height: width * 1.31,
      padding: width * 0.09
    })

    css(title, _.extend(_.clone(base), {
      fontSize: '14px',
      left: '10px',
      right: '10px',
      top: '10px',
      bottom: '40px',
      overflowY: 'scroll',
      overflowX: 'hidden'
    }))

    css(author, _.extend(_.clone(base), {
      fontSize: '10px',
      left: '10px',
      right: '40px',
      bottom: '10px'
    }))

    css(year, _.extend(_.clone(base), {
      position: 'absolute',
      fontSize: '14px',
      left: '120px',
      right: '10px',
      bottom: '10px'
    }))

  }

  self.update = function (value) {
    Object.assign(this, value)

    var pmcid = _.find(self.document.identifier, { type: 'pmcid' }).id
    this.pmcid = `PMC${pmcid}`

    title.innerHTML = value.document.title
    author.innerHTML = self.etalia(value.document.author)
    year.innerHTML = value.document.year

    self.updateBar(0, 9999)
    self.loadFile()
  }

  self.downloading = function (res, url) {
    if (/fullTextXML/.test(url)) {
      self.downloadingXML(res, url)
    } else if (/supplementaryFiles/.test(url)) {
      // self.downloadingSupplementaryFiles(res, url)
    }
  }

  self.downloadingXML = function (res, url) {
    if (!res.headers['content-length']) {
      // return
    }

    var total = parseInt(res.headers['content-length'], 10) || 100000
    var done = 0

    res.on('data', function (data) {
      done += data.length
      self.updateBar(done, total)
    })

    res.on('error', function (err) {
      self.downloadFailed(err)
      console.log(err)
    })

    res.on('end', function () {
      self.downloaded({ path: self.filepath() })
    })
  }

  self.updateBar = function (done, total) {
    css(bar, { width: `${Math.min((done / total) * 100, 100)}%`})
  }

  self.stringForAuthor = function(a) {
    return `${a.given_names} ${a.surname}`
  }

  self.etalia = function (authors) {
    var authorStrs = authors.map(self.stringForAuthor)
    if (authors.length > 3) {
      return self.stringForAuthor(authors[0]) + ' et al.'
    } else {
      return authorStrs.join(', ')
    }
  }

  self.truncate = function (str, limit) {
    var  bits = str.split('')
    if (bits.length > limit) {
      for (var i = bits.length - 1; i > -1; --i) {
        if (i > limit) {
          bits.length = i
        }
        else if (' ' === bits[i]) {
          bits.length = i
          break
        }
      }
      bits.push('...')
    }
    return bits.join('')
  };

  self.downloadFailed = function (err) {
    css(bar, {
      width: '100%',
      backgroundColor: 'rgb(202,77,107)'
    })
  }

  self.downloaded = function (file) {
    self.file = file.path
    css(bar, {
      width: '100%'
    })
  }

  self.loadFile = function () {
    var filepath = self.filepath()
    fs.stat(filepath, function(err, stat) {
      if (err == null) {
        // file exists - show lens viewer button
        // and completion bar
        self.downloaded({ path: filepath })
        // console.log('paper should be located at', filepath)
      } else if(err.code == 'ENOENT') {
        // file doesn't exist - do nothing
      } else {
        console.log('Error looking for file: ', filepath, err);
      }
    });
  }

  self.filepath = function() {
    var dir = opts.fulltextSource.dir
    var pmcid = self.pmcid
    var filepath = path.join(opts.datadir, dir, pmcid, 'fulltext.xml')
    return filepath
  }

  self.url = function() {
    var port = opts.contentServer.port
    var dir = opts.fulltextSource.dir
    var pmcid = self.pmcid
    var url = `http://localhost:${port}/${dir}/${pmcid}/fulltext.xml`
    console.log('paper should be served at', url)
    return url
  }

  self.layout()

  box.onclick  = function () {
    self.emit('click')
  }

  box.addEventListener("mouseenter", function(event) {
    if (self.file && contentServer.port) css(overlay, { display: 'flex' })
  })

  box.addEventListener("mouseleave", function(event) {
    css(overlay, { display: 'none' })
  })

  lens.onclick = function () {
    self.emit('lens-click')
    lensReader = reader(self, self.opts)
    lensReader.show()
    // TODO: destroy on close
  }
}

module.exports = Paper
