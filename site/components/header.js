const html = require('choo/html')
const menu = require('./menu')
const h1 = require('./h1')

const tagline = () => html`

<h2 class="w-100 dark-gray f2 tc">
  The open source p2p desktop science library that puts users in control.
</h2>

`

module.exports = () => html`

<div class="header-container w-100 pa1 pa3-m ph5-ns pv3-ns tc">
  <img class="w-80-ns w-100" src="assets/header.svg" alt="header-image"/>
  ${h1({ content: tagline(), dark: true })}
  ${menu()}
  <p>
    How we access, read and reuse scientific literature is largely controlled by a few vast publishing organisations. Innovation is either rare and slow, or hard to find, and almost always under the control of platforms. We have a vision of a different, better, more inclusive and open future for Science.
  </p>
  <p>
    <strong>ScienceFair is a new kind of desktop science library</p> that shows one path to that future. The main thing that sets it apart? <strong>Freedom from centralised control</strong>.
  </p>
</div>

`
