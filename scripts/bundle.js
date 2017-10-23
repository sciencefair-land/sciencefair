var fs = require('fs')
var path = require('path')

var browserify = require('browserify')

// transforms
var renderify = require('/Users/rik/c/blahah/electron-renderify/index.js')
var envify = require('envify')
var unassertify = require('unassertify')
var yoyoify = require('yo-yoify')

// plugins
var shakeify = require('common-shakeify')

// uglify
var uglify = require('minify-stream')

var appdir = path.join(__dirname, '..', 'app')
var appfileIn = path.join(appdir, 'index.js')
var appfileOut = path.join(appdir, 'bundle.js')

var clientdir = path.join(appdir, 'client')
var clientfileIn = path.join(clientdir, 'index.js')
var clientfileOut = path.join(clientdir, 'index.js')

var writeApp = fs.createWriteStream(appfileOut)
var writeClient = fs.createWriteStream(clientfileOut)

var browserifyOpts = {
  builtins: [],
  commonDir: false,
  detectGlobals: false,
  ignoreMissing: true,
  insertGlobalVars: 'global',
  browserField: false,
  bundleExternal: false
}

// app
browserify(browserifyOpts)
  .transform(envify)
  .transform(unassertify)
  .plugin(shakeify)
  // .transform(yoyoify, { global: true })
  .add(appfileIn)
  .bundle()
  .pipe(uglify())
  .pipe(writeApp)

var renderifyOpts = {
  windowRequire: [
    'leveldown'
  ]
}

// client
browserify(browserifyOpts)
  .transform(renderify, renderifyOpts)
  .transform(envify)
  .transform(unassertify)
  .plugin(shakeify)
  // .transform(yoyoify, { global: true })
  .external('node_modules/electron/**/*')
  .add(clientfileIn)
  .bundle()
  .pipe(uglify())
  .pipe(writeClient)
