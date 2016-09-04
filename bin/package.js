#!/usr/bin/env node

var os = require('os')
var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
var rimraf = require('rimraf')
var zip = require('cross-zip')
var targz = require('tar.gz')
var minimist = require('minimist')
var packager = require('electron-packager')
var pkg = require('../package.json')

var config = {
  APP_COPYRIGHT: 'Copyright © 2016 Code For Science',
  ROOT_PATH: path.join(__dirname, '..'),
  APP_NAME: 'ScienceFair',
  APP_ICON: path.join(__dirname, '..', 'static', 'ScienceFair'),
  APP_VERSION: pkg.version,
  STATIC_PATH: path.join(__dirname, '..', 'static')
}

var BUILD_NAME = config.APP_NAME + '-v' + config.APP_VERSION
var DIST_PATH = path.join(config.ROOT_PATH, 'dist')

var argv = minimist(process.argv.slice(2), {})

function build () {
  rimraf.sync(DIST_PATH)
  var platform = argv._[0]
  if (!platform) {
    buildDarwin(printDone)
    buildLinux(printDone)
  }
  if (platform === 'darwin') {
    buildDarwin(printDone)
  } else if (platform === 'linux') {
    buildLinux(printDone)
  }
}

var all = {
  dir: config.ROOT_PATH,
  asar: true,
  name: config.APP_NAME,
  out: DIST_PATH,
  overwrite: true,
  prune: false,
  version: require('electron-prebuilt/package.json').version,
  'app-copyright': config.APP_COPYRIGHT,
  'app-version': pkg.version,
  'asar-unpack': 'ScienceFair*',
  'build-version': pkg.version
}

var darwin = {
  platform: 'darwin',
  arch: 'x64',
  icon: config.APP_ICON + '.icns',
  'app-bundle-id': 'io.sciencefair.sciencefair',
  'app-category-type': 'public.app-category.utilities',
  'helper-bundle-id': 'io.sciencefair.sciencefair-helper'
}

var linux = {
  platform: 'linux',
  arch: 'x64',
  icon: config.APP_ICON + '.icns',
}

build()

function buildLinux (cb) {
  console.log('Linux: Packaging electron...')
  packager(Object.assign({}, all, linux), function (err, buildPath) {
    if (err) return cb(err);
    console.log('Linux: Packaged electron. ' + buildPath);
    var targetPath = path.join(DIST_PATH, BUILD_NAME + '_linux-x64.tar.gz');
    rimraf.sync(targetPath);
    targz().compress(buildPath[0], targetPath).then(function() {
      console.log('Linux: Created tarball ' + targetPath);
      }).catch(cb);
  })
}

function buildDarwin (cb) {
  console.log('OS X: Packaging electron...')
  packager(Object.assign({}, all, darwin), function (err, buildPath) {
    if (err) return cb(err)
    console.log('OS X: Packaged electron. ' + buildPath)

    var appPath = path.join(buildPath[0], config.APP_NAME + '.app')

    pack(cb)

    function pack (cb) {
      packageZip()
      packageDmg(cb)
    }

    function packageZip () {
      console.log('OS X: Creating zip...')

      var inPath = path.join(buildPath[0], config.APP_NAME + '.app')
      var outPath = path.join(DIST_PATH, BUILD_NAME + '-darwin.zip')
      zip.zipSync(inPath, outPath)

      console.log('OS X: Created zip.')
    }

    function packageDmg (cb) {
      console.log('OS X: Creating dmg...')

      var appDmg = require('appdmg')
      if (!appDmg) {
        throw "Can't create DMG without app-dmg!"
      }


      var targetPath = path.join(DIST_PATH, BUILD_NAME + '.dmg')
      rimraf.sync(targetPath)

      var dmgOpts = {
        basepath: config.ROOT_PATH,
        target: targetPath,
        specification: {
          title: config.APP_NAME,
          icon: config.APP_ICON + '.icns',
          background: path.join(config.STATIC_PATH, 'appdmg.png'),
          'icon-size': 128,
          contents: [
            { x: 122, y: 150, type: 'file', path: appPath },
            { x: 380, y: 150, type: 'link', path: '/Applications' },
            { x: 50, y: 500, type: 'position', path: '.background' },
            { x: 100, y: 500, type: 'position', path: '.DS_Store' },
            { x: 150, y: 500, type: 'position', path: '.Trashes' },
            { x: 200, y: 500, type: 'position', path: '.VolumeIcon.icns' }
          ]
        }
      }

      var dmg = appDmg(dmgOpts)
      dmg.once('error', cb)
      dmg.on('progress', function (info) {
        if (info.type === 'step-begin') console.log(info.title + '...')
      })
      dmg.once('finish', function (info) {
        console.log('OS X: Created dmg.')
        cb(null)
      })
    }
  })
}

function printDone (err) {
  if (err) console.error(err.message || err)
}
