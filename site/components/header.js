const html = require('choo/html')
const menu = require('./menu')
const h1 = require('./h1')
const intro = require('./intro')

const tagline = () => html`

<h2 class="center w-80 dark-gray f2 tc">
  A desktop app for discovering, reading, and organizing science.
</h2>

`

module.exports = () => html`

<div class="header-container w-100 pa1 pa3-m ph5-ns pv4-ns tc center">
  <img class="w-90 w-70-ns" src="assets/header.svg" alt="header-image"/>
  ${h1({ content: tagline(), dark: true })}
  <h3 class="center w-50 dark-gray f3 tc">
    It's not like anything you've used before - ScienceFair showcases the future of scientific literature.
  </h3>
  <p>You can learn more about our vision in our <a href="https://elifesciences.org/labs/88b45406/sciencefair-a-new-desktop-science-library">eLife Labs introductory blog post</a>.</p>
  ${menu()}
</div>

`
