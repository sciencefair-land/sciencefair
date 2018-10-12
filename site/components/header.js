const html = require('choo/html')
const menu = require('./menu')

const tagline = () => html`

<h2 class="center w-80 dark-gray f2 tc fw4 upper">
  The <em>futuristic</em>, <em>fabulous</em> and <em>free</em> desktop app for working with scientific literature
</h2>

`

module.exports = () => html`

<div class="w-100 tc center avenir">
  ${tagline()}
  <img class="w-90 w-70-ns" src="assets/header.svg" alt="header-image"/>
  <h3 class="center w-70 dark-gray f3 tc fw4 lh-copy">
    <strong>Discover, collect, organise, read and analyse</strong> scientific papers.<br/>
    Be part of a movement to <strong>make science fair</strong>.<br/>
  </h3>
  ${menu()}
</div>

`
