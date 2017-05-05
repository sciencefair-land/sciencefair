<div align="center"><img src="https://github.com/codeforscience/sciencefair/raw/master/assets/header.png" width="100%" /></div>

<p align="center">
  <strong>Search, collect, read and reuse the scientific literature.</strong>
</p>

<p align="center">
  <!-- Stability -->
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square"
      alt="API stability" />
  </a>
  <!-- Release -->
  <a href="https://github.com/codeforscience/sciencefair/releases/latest">
    <img src="https://img.shields.io/github/release/codeforscience/sciencefair.svg?style=flat-square"
      alt="Latest release" />
  </a>
  <!-- Downloads -->
  <a href="https://github.com/codeforscience/sciencefair/releases/latest">
    <img src="https://img.shields.io/github/downloads/codeforscience/sciencefair/total.svg?style=flat-square" />
  </a>
  <!-- License -->
  <a href="https://github.com/codeforscience/sciencefair/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-green.svg?style=flat-square"
      alt="MIT license" />
  </a>
  <!-- Made with <3 -->
  <a href="http://codeforscience.org" target="_blank">
    <img src="https://img.shields.io/badge/made_with-❤️💛💚💙💜-e6e6e6.svg?style=flat-square" />
  </a>
</p>

ScienceFair is a desktop science library like nothing before. The main thing that sets it apart? **Freedom from centralised control.**

We aim to create a desktop experience for discovering, tracking, collecting and reading scientific articles that:

- is completely free from external control (e.g. by publishers or platforms)
- allows the user to customise their experience
- helps decentralise the scholarly literature
- promotes and integrates open data and metadata
- helps grow an ecosystem of open source tools around scientific literature

## TOC

- [downloads](#downloads)
- [technical details](#technical-details)
- [screenshots](#screenshots)
	- [home screen](#home-screen)
	- [search results](#search-results)
	- [selection & stats](#selection--stats)
	- [reader](#reader)
- [development](#development)

## downloads

You can download installers or bundled apps for Windows, Mac and Linux from the [releases page](https://github.com/codeforscience/sciencefair/releases).

Please note that ScienceFair is currently pre-release, so there will be bugs - we're working hard to polish it to v1 release standard. If you'd like to [report bugs in the issue tracker](https://github.com/codeforscience/sciencefair/issues), that would be super helpful.

## technical details

Some of the things that ScienceFair does differently:

- users can subscribe to any datasources they choose
- a datasource can be a journal (eLife is provided as the default), a curated community collection, a personal reading list...
- datasources are backed by peer-to-peer networks (using [dat](https://datproject.org/))
- anyone can create a datasource (tools to make this easy coming soon)
- papers are stored in JATS XML format - perfect for data mining
- basic data-mining and bibliometrics are built-in (see [screenshots](#selection--stats))
- we use the beautiful [Lens reader](https://github.com/elifesciences/lens) - no PDFs

ScienceFair also follows a few simple design principles that we feel are missing from the ecosystem:

- we keep the interface minimal and clear
- incremental discovery is the way
- be beautiful

## screenshots

### home screen

<img src="https://github.com/codeforscience/sciencefair/raw/master/assets/screenshots/home.png" alt="home screen" />

### search results

<img src="https://github.com/codeforscience/sciencefair/raw/master/assets/screenshots/results.png" alt="results" />

### selection & stats

<img src="https://github.com/codeforscience/sciencefair/raw/master/assets/screenshots/selection.png" alt="selection" />

### reader

<img src="https://github.com/codeforscience/sciencefair/raw/master/assets/screenshots/reader.png" alt="reader" />

## development

This project uses node `v7`, ideally the latest version. It also uses the two-`package.json` structure ([what??](https://github.com/electron-userland/electron-builder/wiki/Two-package.json-Structure)).

To get a local copy working:

Clone this repo, then run

- `npm install` to install dev dependencies
- `cd app && npm install && npm run rebuild` to install regular dependencies

cd back to the root of the repo and run

- `npm run dev` to start in development mode
