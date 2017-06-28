const html = require('choo/html')
const a = require('./a')

const tryit = () => a({ href: '#install', content: 'try it' })
const joinus = () => a({ href: '#community', content: 'join us' })

module.exports = () => html`

<div class="w-100 tc dark-gray pt3">
  <div class="w-70-ns w-90 center ba pa4 ph5">
    <h3 class="w-100 tc center f3 lh-copy dark-gray">
      Why ScienceFair?
    </h3>
    <p class="w-100 tl center f3 lh-copy dark-gray">
      How we access, read and reuse scientific literature is largely controlled
      by a few vast publishing organisations. This is holding society back.
    </p>
    <p class="w-100 tl f3 lh-copy dark-gray">
      Many wonderful innovations are being
      explored outside those organisations, but they are rarely
      integrated into the platforms where people actually access science.
    </p>
    <p class="w-100 tl f3 lh-copy dark-gray">
      <strong>We have a vision of a different, better, future for science.</strong>
      A future that's more <strong>fair, inclusive and open.</strong>
      A future that makes it easy to <strong>innovate and explore</strong> and where
      <strong>users control and customise their experience</strong>.
    </p>
    <p class="w-100 tl f3 lh-copy dark-gray">
      <strong>ScienceFair aims to help pave the road to that future.</strong>
      The main thing that sets it apart?
      <strong>Freedom from centralised control.</strong>
    </p>
    <p class="w-100 tl f3 lh-copy dark-gray">
      Our version 1 release is just the first step. We hope you'll ${tryit()} and ${joinus()}.
    </p>
    <p class="w-100 tl f3 lh-copy dark-gray">
      <small>Thanks, <em>The ScienceFair team</em></small>
    </p>
  </div>
</div>

`
