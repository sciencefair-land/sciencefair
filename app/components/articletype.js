var inherits = require('inherits')
var _ = require('lodash')
var EventEmitter = require('events').EventEmitter
var css = require('dom-css')
var yo = require('yo-yo')

inherits(ArticleType, EventEmitter)

function ArticleType (type) {
  if (!(this instanceof ArticleType)) return new ArticleType(type)
  var self = this

  var width = 40
  var height = width

  // some types are irritating - pluggable filters would be good
  type = type.replace(/Environews/, 'enviro- news')

  var words = _.words(type)
  var initials
  if (words.length === 1) {
    initials = words[0].substring(0, 2)
  } else {
    initials = words.map((w) => w.substring(0, 1)).join('')
  }

  type = words.join(' ')

  var acronym = yo`
  <div>${initials}</div>
  `
  css(acronym, {
    fontFamily: 'Aleo-Regular',
    fontSize : '1.4em',
    textTransform: 'capitalize',
  })

  var fullname = yo`
  <div>${type}</div>
  `
  css(fullname, {
    width: '100%',
    height: '100%',
    fontFamily: 'CooperHewitt-Medium',
    fontSize : '0.5em',
    textTransform: 'uppercase',
    display: 'none',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    // wordBreak: 'break-all',
    hyphens: 'auto'
  })

  self.element = yo`
  <div class="article-type">
    ${acronym}
    ${fullname}
  </div>
  `
  css(self.element, {
    width: width,
    height: height,
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'rgb(178, 180, 184)',
    color: 'rgb(43, 43, 51)',
    padding: '4px'
  })

  self.element.addEventListener("mouseenter", function(event) {
    css(acronym, { display: 'none' })
    css(fullname, { display: 'flex' })
  })

  self.element.addEventListener("mouseleave", function(event) {
    css(acronym, { display: 'flex' })
    css(fullname, { display: 'none' })
  })

}

module.exports = ArticleType
