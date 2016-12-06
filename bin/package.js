#!/usr/bin/env node

const os = require('os')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const zip = require('cross-zip')
const minimist = require('minimist')
const packager = require('electron-packager')
const installer = require('electron-installer-windows')
const pkg = require('../package.json')

const config = {
  APP_COPYRIGHT: 'Copyright © 2016 Code For Science',
  ROOT_PATH: path.join(__dirname, '..'),
  APP_NAME: 'ScienceFair',
  APP_ICON: path.join(__dirname, '..', 'static', 'ScienceFair'),
  APP_VERSION: pkg.version,
  STATIC_PATH: path.join(__dirname, '..', 'static')
}

const BUILD_NAME = config.APP_NAME + '-v' + config.APP_VERSION
const DIST_PATH = path.join(config.ROOT_PATH, 'dist')

const argv = minimist(process.argv.slice(2), {})

function build () {
  rimraf.sync(DIST_PATH)
  const platform = argv._[0]
  if (platform === 'darwin') {
    buildDarwin(printDone)
  } else if (platform === 'win32') {
    buildWin(printDone)
  } else {
    buildDarwin(err => {
      if (err) return printDone(err)
      buildWin(printDone)
    })
  }
}

const all = {
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

const darwin = {
  platform: 'darwin',
  arch: 'x64',
  icon: config.APP_ICON + '.icns',
  'app-bundle-id': 'io.sciencefair.sciencefair',
  'app-category-type': 'public.app-category.utilities',
  'helper-bundle-id': 'io.sciencefair.sciencefair-helper',
  'sign': true
}

const win32 = {
  platform: 'win32',
  arch: 'x64',
  icon: config.APP_ICON + '.ico',
  iconUrl: 'https://github.com/codeforscience/sciencefair/raw/v1_dev/static/ScienceFair.ico',
  win32metadata: {
    'CompanyName': 'Code for Science',
    'ProductName': 'ScienceFair'
  }
}

build()

function buildWin (cb) {
  console.log('Windows: Packaging electron...')
  packager(Object.assign({}, all, win32), function (err, buildPath) {
    if (err) return cb(err)
    console.log('Windows: Packaged electron. ' + buildPath)

    var exePath = path.join(buildPath[0], config.APP_NAME + '.exe')

    pack(cb)

    function pack (cb) {
      packageZip()
      packageExe(cb)
    }

    function packageZip () {
      console.log('Windows: Creating zip...')

      var inPath = path.join(buildPath[0], config.APP_NAME + '.exe')
      var outPath = path.join(DIST_PATH, BUILD_NAME + '-darwin.zip')
      zip.zipSync(inPath, outPath)

      console.log('Windows: Created zip.')
    }

    function packageExe () {
      console.log('Windows: creating installer...')
      const opts = {
        src: 'dist/ScienceFair-win32-x64',
        dest: 'dist/installers'
      }
      installer(opts, err => {
        if (err) return cb(err)
        console.log('Windows: created installer.')
        cb()
      })
    }
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
      dmg.once('end', function (info) {
        console.log('OS X: Created dmg.')
        cb(null)
      })
    }
  })
}

function printDone (err) {
  if (err) return console.error(err.message || err)
  console.log('All tasks completed.')
}
