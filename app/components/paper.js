var css = require('dom-css')
var inherits = require('inherits')
var _ = require('lodash')
var EventEmitter = require('events').EventEmitter

inherits(Paper, EventEmitter)

function Paper (container) {
  if (!(this instanceof Paper)) return new Paper(container)
  var self = this

  var box = container.appendChild(document.createElement('div'))
  box.className = 'paper'
  var title = box.appendChild(document.createElement('div'))
  var author = box.appendChild(document.createElement('div'))
  var year = box.appendChild(document.createElement('div'))
  var overlay = box.appendChild(document.createElement('div'))
  var lens = overlay.appendChild(document.createElement('img'))
  lens.src = './images/lens.png'

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
    console.log(value)
    title.innerHTML = value.title
    author.innerHTML = self.etalia(value.authorString)
    year.innerHTML = value.year

    self.loadFile()
  }

  self.etalia = function (authorString) {
    var authors = authorString.split(', ')
    return authors.length > 3 ? authors[0] + ' et al.' : authorString
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
    css(box, {
      borderBottom: 'solid 7px rgb(202,77,107)'
    })
  }

  self.downloaded = function (file) {
    self.file = file.path
    css(box, {
      borderBottom: 'solid 7px rgb(202, 172, 77)'
    })
  }

  self.loadFile = function () {
    var self = this
    var filedir = path.join(path.resolve('data'), 'eupmc_fulltexts')
    var filepath = path.join(filedir, this.pmcid, "fulltext.xml")
    fs.stat(filepath, function(err, stat) {
      if (err == null) {
        // file exists - show lens viewer button
        self.downloaded({ path: filepath })
      } else if(err.code == 'ENOENT') {
        // file doesn't exist - do nothing
      } else {
        console.log('Error looking for file: ', filepath, err);
      }
    });
  }


  self.layout()

  box.onclick  = function () {
    self.emit('click')
  }

  box.addEventListener("mouseenter", function(event) {
    if (self.file) css(overlay, { display: 'flex' })
  })

  box.addEventListener("mouseleave", function(event) {
    css(overlay, { display: 'none' })
  })

  lens.onclick = function () {
    self.emit('lens-click')
  }
}

module.exports = Paper
