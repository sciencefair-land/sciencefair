var inherits = require('inherits')
var _ = require('lodash')
var EventEmitter = require('events').EventEmitter
var css = require('dom-css')
var yo = require('yo-yo')

inherits(AssetIcon, EventEmitter)

function AssetIcon (opts) {
  if (!(this instanceof AssetIcon)) return new AssetIcon(opts)
  var self = this

  self.opts = opts
  var width = opts.width || 34
  var height = width * 1.27

  self.render = function() {
    var element = yo`
    <div class="asset-icon clickable">
      ${self.svg()}
      ${self.text()}
    </div>
    `
    css(element, {
      width: width,
      height: height,
      display: opts.hidden ? 'none' : 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      alignContent: 'center',
      justifyContent: 'center',
      position: 'relative',
      color: 'rgba(43, 43, 51, 1)',
      marginLeft: 10,
      marginBottom: 10
    })

    if (!self.element) {
      self.element = element
    } else {
      yo.update(self.element, element)
    }
  }

  self.text = function () {
    var element = yo`
    <div>${self.opts.ext}</div>
    `
    css(element, {
      fontFamily: 'CooperHewitt-Medium',
      fontSize : '0.9em',
      marginTop: '40%',
      textTransform: 'uppercase',
      zIndex: 601
    })
    return element
  }

  self.svg = function () {
    var element = yo`
    <svg viewBox="40 10 207 268"><path d="M241.1,75.7c0-2.3-0.9-4.6-2.6-6.3l-48.4-51.8c-1.7-2-4.3-2.9-6.9-2.9h-121c-8.4,0-15.3,6.9-15.3,15.3v228.4
    	c0,8.4,6.9,15.3,15.3,15.3h163.9c8.4,0,15.3-6.9,15.3-15.3L241.1,75.7z"/>
    </svg></svg>
    `
    css(element, {
      transition: 'all 1.5s',
      stroke: 'transparent',
      fill: self.opts.bgcolor || 'rgb(178, 180, 184)',
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      zindex: 600
    })

    return element
  }

  self.setBackground = function (color) {
    self.opts.bgcolor = color
    self.render()
  }

  self.hide = function () {
    self.opts.hidden = true
    self.render()
  }

  self.show = function () {
    self.opts.hidden = false
    self.render()
  }

  self.error = self.hide

  self.downloading = function() {
    self.setBackground('rgb(178, 180, 184)')
  }

  self.found = function () {
    self.setBackground('rgb(202, 172, 77)')
    self.show()
  }

  self.render()

}

module.exports = AssetIcon
