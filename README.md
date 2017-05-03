<div align="center"><img src="https://github.com/codeforscience/sciencefair/raw/master/assets/header.png" /></div>

<h1 align="center">science fair</h3>
<p align="center">
  <strong>Search, collect, read and reuse the scientific literature.</strong><br/><br/>
</p>

ScienceFair is a desktop science library like nothing before. The main thing that sets it apart? **Freedom from centralised control.**

Some of the things that ScienceFair does differently:

- users can subscribe to any datasources they choose
- datasources are backed by peer-to-peer networks (using [dat](https://datproject.org/))
- anyone can create a datasource (tools to make this easy coming soon)
- papers are stored in JATS XML format - perfect for data mining
- basic data-mining and bibliometrics are built-in (see [screenshots](#selection-stats))
- we use the beautiful [Lens reader](https://github.com/elifesciences/lens) - no PDFs

ScienceFair also follows a few simple design principles that we feel are missing from the ecosystem:

- we keep the interface minimal and clear
- incremental discovery is the way
- be beautiful

## TOC

- [downloads](#downloads)
- [screenshots](#screenshots)
	- [home screen](#home-screen)
	- [search results](#search-results)
	- [selection & stats](#selection-stats)
	- [reader](#reader)
- [development](#development)

## downloads

You can download installers or bundled apps for Windows, Mac and Linux from the [releases page](https://github.com/codeforscience/sciencefair/releases).

Please note that ScienceFair is currently pre-release, so there will be bugs - we're working hard to polish it to v1 release standard. If you'd like to [report bugs in the issue tracker](https://github.com/codeforscience/sciencefair/issues), that would be super helpful.

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
