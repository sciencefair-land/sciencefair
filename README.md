<div align="center"><img src="https://raw.githubusercontent.com/codeforscience/sciencefair/master/assets/header_v2.png" width="100%" /></div>

<p align="center">
  <strong>The open source p2p desktop science library that puts users in control.</strong>
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
  <a href="https://codeforscience.org" target="_blank">
    <img src="https://img.shields.io/badge/made_with-❤️💛💚💙💜-e6e6e6.svg?style=flat-square" />
  </a>
</p>

> **We've released [:balloon: v1.0 :balloon:](https://github.com/codeforscience/sciencefair/releases/latest)! But we're just getting started. Check out the [roadmap](#roadmap) to see where we're headed.**

---

## Why ScienceFair?

How we access, read and reuse scientific literature is largely controlled
by a few vast publishing organisations. Many wonderful innovations are being
explored outside those organisations, but they are rarely
integrated into the platforms where people actually access science.

**We have a vision of a different, better, future for science.** A future that's more **fair, inclusive and open.**
A future where **people can explore and innovate** and where **users control and customise their experience**.

**ScienceFair aims to help pave the road to that future.** The main thing that sets it apart? **Freedom from centralised control.**

---

We're creating a desktop experience for discovering, tracking, collecting and reading scientific articles that:

- is completely free from external control (e.g. by publishers or platforms)
- helps decentralise the distribution and storage of the scholarly literature
- allows the user to customise their experience
- promotes and integrates open data and metadata
- helps grow an ecosystem of open source tools around scientific literature

## contents

- [downloads](#downloads)
- [technical details](#technical-details)
- [screenshots](#screenshots)
	- [home screen](#home-screen)
	- [search results](#search-results)
	- [selection & stats](#selection--stats)
	- [reader](#reader)
- [development](#development)
- [roadmap](#roadmap)

## downloads

You can download installers or bundled apps for Windows, Mac and Linux from the [releases page](https://github.com/codeforscience/sciencefair/releases).

If you find a bug, please [report it in the issue tracker](https://github.com/codeforscience/sciencefair/issues).

## technical details

Some of the things that ScienceFair does differently:

### A reading experience optimised for Science

We use the beautiful [Lens reader](https://github.com/elifesciences/lens) to render JATS XML to a reading experience optimised for scientific papers.

<img src="https://github.com/codeforscience/sciencefair/raw/master/assets/screenshots/reader.png" alt="reader" />

### Instant multi-source search

Instant search of your local collection **and** remote datasources, only downloading the data requested.

<img src="https://github.com/codeforscience/sciencefair/raw/master/assets/screenshots/results.png" alt="results" />

### Secure, flexible, distributed datasources

A ScienceFair datasource can be a journal, a curated community collection, a personal reading list... anything you like.

v1.0 comes with the eLife journal by default, and more will follow very soon.

Datasources are append-only feeds of JATS XML articles, signed with public-key encryption and distributed peer-to-peer (using [dat](https://datproject.org/)). This means:

- downloads come from the nearest, fastest sources
- it doesn't matter if the original source goes offline
- only the original creator can add new content
- anyone can create a datasource (tools to make this easy [coming soon](#roadmap))
- your local collection of articles is ready for data mining

And importantly, **datasources you create are private** unless you decide to share them, and **nobody can ever take a datasource offline**.

### Built-in bibliometrics and analytics

Basic bibliometrics are built-in in `v1.0`.

Full analysis and data-mining tools, alt-metrics and enriched annotation will be [coming soon](#roadmap).

<img src="https://github.com/codeforscience/sciencefair/raw/master/assets/screenshots/selection.png" alt="selection" />

ScienceFair also follows a few simple design principles that we feel are missing from the ecosystem:

- we keep the interface minimal and clear
- incremental discovery is the way
- be beautiful

<img src="https://github.com/codeforscience/sciencefair/raw/master/assets/screenshots/home.png" alt="home screen" />

## development

This project uses node `v7`, ideally the [latest version](https://nodejs.org/dist/latest-v7.x/). It also uses the two-`package.json` structure ([what??](https://github.com/electron-userland/electron-builder/wiki/Two-package.json-Structure)).

To get a local copy working, clone this repo, then run

- `npm install` to install dev dependencies
- `cd app && npm install` to install regular dependencies
- `cd .. && npm run dev` to start in development mode

## roadmap

- [x] `v1.0` **proof of concept**:
  - incorporate major new technologies (dat/hyperdrive, lens reader, instant search)
  - core user experience and design
  - development, packaging and distribution architecture in place
  - `1.0.x` releases will be bug fixes and non-breaking improvements
- [ ] `v1.1` **focus on datasources**:
  - more, and bigger, datasources available by default
  - tools for creating and managing datasources
  - interface for creating and securely sharing p2p collections within the app
  - a platform and interface for discovering and managing datasources
- [ ] `v1.2` **focus on enrichment**:
  - altmetrics, updates (e.g. retractions), etc. displayed in context in realtime
  - advanced bibliometrics and data-mining tools
  - annotation and commenting, within the app and drawn from existing sources
- [ ] `v2.0` **focus on user customisation**:
  - a package system, allowing customising and extending key aspects of the experience
  - tools and documentation for making new packages
  - a platform and interface for discovering and managing packages
