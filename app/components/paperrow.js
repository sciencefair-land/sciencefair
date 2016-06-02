var inherits = require('inherits')
var EventEmitter = require('events').EventEmitter
var path = require('path')

var yo = require('yo-yo')

var reader = require('../lib/reader.js')
var asseticon = require('./asseticon.js')
var loading = require('./loading.js')
var articletype = require('./articletype.js')
var textMinedTerms = require('./textminedterms.js')
var overlay = require('./overlay.js')
var highlight = require('../lib/highlight.js')
var _ = require('lodash')

inherits(PaperRow, EventEmitter)

function PaperRow (paper, opts) {
  if (!(this instanceof PaperRow)) return new PaperRow(paper, opts)
  var self = this
  self.paper = paper
  self.opts = opts

  var lensReader = null

  self.assetActions = {
    xml: function (asset) {
      self.emit('xml-click')
      console.log('xml-click')
      lensReader = reader(self.paper, self.opts)
      lensReader.show()
    },
    json: function (asset) {
      console.log('json-click')
    },
    jpg: function (asset) {
      console.log('jpg-click', asset)
      var img = yo`
      <div>
      ${Array.from(asset.paths).map(function (p) {
        return yo`<img src='${p}' />`
      })}
      </div>
      `
      overlay(img)
    }
  }
  self.assetActions.jpeg = self.assetActions.jpg

  self.assetAction = function (asset) {
    var action = self.assetActions[asset.opts.ext]
    if (action) action(asset)
  }

  self.assets = {}

  self.getAssets = function () {
    return _.map(self.assets, (value, key) => value.element)
  }

  self.loading = loading({
    position: 'absolute',
    bottom: 0,
    right: 4,
    display: 'none'
  })

  self.type = articletype(self.paper.type)

  self.terms = textMinedTerms(self.paper)

  self.render = function () {
    var row = yo`
    <div class="row paper-table-row clickable paper">
      <div class="td paper-element paper-type">${self.type.element}</div>
      <div class="td paper-element paper-biblio">
        <div class="row">
          <div class="paper-element paper-title">${self.paper.title}</div>
        </div>
        <div class="row">
          <div class="paper-element paper-author">${self.paper.etalia()}</div>
          <div class="paper-element paper-year">${self.paper.year}</div>
          <div class="paper-element paper-ids">
            ${self.paper.identifier
              .filter((id) => id.type !== 'publisher-id')
              .map((id) => {
                return yo`
                <div class="paper-table-row-id clickable">
                  <span class="paper-id-type">${id.type}</span>
                  <span class="paper-id-id">${id.id}</span>
                </div>
                `
              })
            }
          </div>
        </div>
      </div>
      <div class="td paper-element paper-data">
        <div class="paper-element paper-terms">
          ${self.terms.render()}
        </div>
        <div class="paper-element paper-actions">
          ${self.getAssets()}
        </div>
      </div>
      ${self.loading.element}
    </div>
    `
    if (self.opts.query) {
      highlight(row.getElementsByClassName('paper-title')[0], self.opts.query)
      highlight(row.getElementsByClassName('paper-author')[0], self.opts.query)
    }

    row.onclick = function () {
      self.emit('click')
    }
    if (self.row) {
      yo.update(self.row, row)
    } else {
      self.row = row
    }
  }

  self.render()

  function getAsset (apath) {
    var ext = path.extname(apath).substring(1)
    if (ext === 'supp') {
      return null
    }
    var asset = self.assets[ext]
    if (!asset) {
      asset = self.assets[ext] = asseticon({ ext: ext })
      asset.on('click', function (asset) { self.assetAction(asset) })
    }
    asset.paths.add(apath)
    return asset
  }

  function updateTextMinedTerms () {
    self.terms.load()
  }

  function updateAssets () {
    self.paper.assetPaths().forEach(function (apath) {
      var asset = getAsset(apath)
      asset.found()
    })
    updateTextMinedTerms()
    self.render()
  }

  var stopLoading = function () {
    if (paper.downloadsRunning === 0) setTimeout(self.loading.hide, 500)
  }

  self.paper.on('download.start', function () {
    console.log('download started')
    self.loading.show()
  })

  self.paper.on('download.finished', function () {
    updateAssets()
    updateTextMinedTerms()
    stopLoading()
  })

  self.paper.on('download.error', function () {
    updateAssets()
    updateTextMinedTerms()
    stopLoading()
  })

  updateAssets()
  updateTextMinedTerms()
}

module.exports = PaperRow
