var inherits = require('inherits')
var _ = require('lodash')
var EventEmitter = require('events').EventEmitter
var css = require('dom-css')
var yo = require('yo-yo')
var fs = require('fs')

inherits(TextMinedTerms, EventEmitter)

function TextMinedTerms (paper) {
  if (!(this instanceof TextMinedTerms)) return new TextMinedTerms(paper)

  var self = this

  self.paper = paper
  self.terms = null

  self.load = function () {
    var rawterms = _.find(self.paper.assetPaths(), function (p) {
      return /textMinedTerms\.json$/.test(p)
    })
    if (rawterms) {
      var json = fs.readFileSync(rawterms, 'utf8')
      self.terms = JSON.parse(json)
    }
  // self.render()
  }

  function renderTypeCount (obj) {
    var name = yo`<div>${obj.name}</div>`
    var count = yo`<div>${obj.count}</div>`
    css(name, {
      marginRight: 5
    })
    var element = yo`<div class="clickable paper-term-badge">${name}${count}</div>`
    css(element, {
      display: 'flex',
      flexDirection: 'row',
      position: 'relative',
      fontFamily: 'CooperHewitt-Book',
      backgroundColor: 'rgb(178, 180, 184)',
      color: 'rgba(43, 43, 51, 1)',
      padding: 6,
      paddingBottom: 0,
      margin: 5,
      borderRadius: 2,
      height: 22
    })
    return element
  }

  self.render = function () {
    self.load()
    if (self.terms === null) return null
    var element = yo`
    <div>
      ${self.terms.semanticTypeCountList.semanticType.map(renderTypeCount)}
    </div>
    `
    css(element, {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      position: 'relative',
      color: 'rgba(43, 43, 51, 1)',
      margin: 5
    })

    if (!self.element) {
      self.element = element
    } else {
      yo.update(self.element, element)
    }
    return self.element
  }
}

module.exports = TextMinedTerms
