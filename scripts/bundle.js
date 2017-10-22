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

var clientdir = path.join(__dirname, '..', 'app', 'client')
var infile = path.join(clientdir, 'index.js')
var outfile = path.join(clientdir, 'bundle.js')
var write = fs.createWriteStream(outfile)

var browserifyOpts = {
  builtins: [],
  commonDir: false,
  detectGlobals: false,
  ignoreMissing: true,
  insertGlobalVars: 'global',
  browserField: false
}

var renderifyOpts = {
  windowRequire: [
    'leveldown'
  ]
}

browserify(browserifyOpts)
  .transform(renderify, renderifyOpts)
  .transform(envify)
  .transform(unassertify)
  .plugin(shakeify)
  // .transform(yoyoify, { global: true })
  .add(infile)
  .bundle()
  .pipe(uglify())
  .pipe(write)
