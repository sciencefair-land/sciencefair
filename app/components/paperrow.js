var css = require('dom-css')
var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var selection = require('d3-selection')

var yo = require('yo-yo')
var csjs = require('csjs')

var iconbutton = require('./iconbutton.js')

inherits(PaperRow, EventEmitter)

function PaperRow (paper, opts) {
  if (!(this instanceof PaperRow)) return new PaperRow(paper, opts)
  var self = this
  this.paper = paper.document

  var lens = iconbutton('./images/lens.png')

  var lensReader = null

  var bar = yo`<div></div>`

  var pmcid = _.find(self.paper.identifier, { type: 'pmcid' })
  this.pmcid = pmcid ? `PMC${pmcid.id}` :  null

  var doi = _.find(self.paper.identifier, { type: 'doi' })
  this.doi = doi ? doi.id : null

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

  lens.onclick = function () {
    self.emit('lens-click')
    lensReader = reader(self, self.opts)
    lensReader.show()
    // TODO: destroy on close
  }

  self.render = function () {
    self.row = yo`
    <div class="row paper-table-row">
      <div class="td col-title">${self.paper.title}</div>
      <div class="td col-author">${self.etalia(self.paper.author)}</div>
      <div class="td col-year">${self.paper.year}</div>
      <div class="td col-pmcid">${self.pmcid}</div>
      <div class="td col-doi">${self.doi}</div>
    </div>
    `
  }

  self.render()

  self.row.onclick  = function () {
    self.emit('click')
  }

  self.row.addEventListener("mouseenter", function(event) {
    // if (self.file && contentServer.port) css(overlay, { display: 'flex' })
  })

  self.row.addEventListener("mouseleave", function(event) {
    // css(overlay, { display: 'none' })
  })


  self.updateBar(0, 9999)
  self.loadFile()

}

module.exports = PaperRow
