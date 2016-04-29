var inherits = require('inherits')
var _ = require('lodash')
var EventEmitter = require('events').EventEmitter
var css = require('dom-css')
var yo = require('yo-yo')
var parsexml = require('xml-parser')
var fs = require('fs')

inherits(TextMinedTerms, EventEmitter)

function TextMinedTerms (paper) {
  if (!(this instanceof TextMinedTerms)) return new TextMinedTerms(paper)

  var self = this

  self.paper = paper
  self.terms = null

  self.load = function() {
    var rawterms = _.find(self.paper.assetPaths(), function(p) {
      return /textMinedTerms\.json$/.test(p)
    })
    if (rawterms) {
      var json = fs.readFileSync(rawterms, 'utf8')
      self.terms = JSON.parse(json)
      console.log(self.terms)
    }
    // self.render()
  }

  function renderTypeCount(obj) {
    var name = yo`<div>${obj.name}</div>`
    var count = yo`<div>${obj.count}</div>`
    css(name, {
      marginRight: 5
    })
    var element = yo`<div>${name}${count}</div>`
    css(element, {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      alignContent: 'center',
      justifyContent: 'center',
      position: 'relative',
      fontFamily: 'CooperHewitt-Book',
      backgroundColor: 'rgb(178, 180, 184)',
      color: 'rgba(43, 43, 51, 1)',
      padding: 2,
      margin: 5,
      borderRadius: 2
    })
    return element
  }

  self.render = function() {
    self.load()
    if (self.terms === null) return null
    var element = yo`
    <div class="asset-icon clickable">
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

  // self.text = function () {
  //   var element = yo`
  //   <div>${self.opts.ext}</div>
  //   `
  //   css(element, {
  //     fontFamily: 'CooperHewitt-Medium',
  //     fontSize : '0.9em',
  //     marginTop: '40%',
  //     textTransform: 'uppercase',
  //     zIndex: 601
  //   })
  //   return element
  // }
  //
  // self.svg = function () {
  //   var element = yo`
  //   <svg viewBox="40 10 207 268">
  //     <path d="M241.1,75.7c0-2.3-0.9-4.6-2.6-6.3l-48.4-51.8c-1.7-2-4.3-2.9-6.9-2.9h-121c-8.4,0-15.3,6.9-15.3,15.3v228.4
  //   	c0,8.4,6.9,15.3,15.3,15.3h163.9c8.4,0,15.3-6.9,15.3-15.3L241.1,75.7z"/>
  //   </svg></svg>
  //   `
  //   css(element, {
  //     transition: 'all 1.5s',
  //     stroke: 'transparent',
  //     fill: self.opts.bgcolor || 'rgb(178, 180, 184)',
  //     position: 'absolute',
  //     left: 0,
  //     top: 0,
  //     width: '100%',
  //     height: '100%',
  //     zindex: 600
  //   })
  //
  //   return element
  // }
  //
  // self.setBackground = function (color) {
  //   self.opts.bgcolor = color
  //   self.render()
  // }
  //
  // self.hide = function () {
  //   self.opts.hidden = true
  //   self.render()
  // }
  //
  // self.show = function () {
  //   self.opts.hidden = false
  //   self.render()
  // }
  //
  // self.error = self.hide
  //
  // self.downloading = function() {
  //   self.setBackground('rgb(178, 180, 184)')
  // }
  //
  // self.found = function () {
  //   self.setBackground('rgb(202, 172, 77)')
  //   self.show()
  // }
  //
  // self.render()

}

module.exports = TextMinedTerms
