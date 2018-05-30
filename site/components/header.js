const html = require('choo/html')
const menu = require('./menu')
const h1 = require('./h1')
const intro = require('./intro')

const tagline = () => html`

<h3 class="w-100 dark-gray f3 tc">
  A desktop app for discovering, reading, and organizing scientific literature. It's not like anything you've used before - ScienceFair is the global science library of the future.
</h3>

`

module.exports = () => html`

<div class="header-container w-100 pa1 pa3-m ph5-ns pv4-ns tc center">
  <img class="w-80-ns w-100" src="assets/header.svg" alt="header-image"/>
  ${h1({ content: tagline(), dark: true })}
  ${menu()}
  ${intro()}
</div>

`
