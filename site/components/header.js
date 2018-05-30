const html = require('choo/html')
const menu = require('./menu')
const h1 = require('./h1')
const intro = require('./intro')

const tagline = () => html`

<h2 class="w-100 dark-gray f2 tc">
  A desktop app for discovering, reading, and organizing science.
</h2>

`

const subline = () => html`

<h3 class="w-100 dark-gray f3 tc">
  It's not like anything you've used before - ScienceFair showcases the future of scientific literature.
</h3>

`

module.exports = () => html`

<div class="header-container w-100 pa1 pa3-m ph5-ns pv4-ns tc center">
  <img class="w-80-ns w-100" src="assets/header.svg" alt="header-image"/>
  ${h1({ content: tagline(), dark: true })}
  ${subline()}
  ${menu()}
  ${intro()}
</div>

`
