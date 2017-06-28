const html = require('choo/html')

module.exports = () => html`

<section id="community" class="w-100 center bg-light-gray pa3 mv3 tl">
  <h1 class="dark-gray f2 tc">Community</h1>
  <p class="f3 w-80-ns lh-copy ph5-ns mid-gray center">
    ScienceFair v1 was developed by
    <a class="no-underline bg-animate hover-bg-light-blue silver hover-dark-gray" href="https://codeforscience.org" target="_blank">Code for Science</a>
    and
    <a class="no-underline bg-animate hover-bg-light-blue silver hover-dark-gray" href="http://fathomlabs.io" target="_blank">FathomLabs</a>
    along with
    <a class="no-underline bg-animate hover-bg-light-blue silver hover-dark-gray" href="https://github.com/codeforscience/sciencefair/graphs/contributors" target="_blank">other contributors</a>,
    with support from
    <a class="no-underline bg-animate hover-bg-light-blue silver hover-dark-gray" href="https://science.mozilla.org" target="_blank">Mozilla Science Lab</a>,
    <a class="no-underline bg-animate hover-bg-light-blue silver hover-dark-gray" href="https://elifesciences.org" target="_blank">eLife</a>
    and the
    <a class="no-underline bg-animate hover-bg-light-blue silver hover-dark-gray" href="https://datproject.org" target="_blank">Dat</a>
    project.
  </p>
  <p class="f3 w-80-ns lh-copy ph5-ns mid-gray center">
    If you find a bug in ScienceFair please report it on the
    <a class="no-underline bg-animate hover-bg-light-blue silver hover-dark-gray" href="https://github.com/codeforscience/sciencefair/issues" target="_blank">issue tracker</a>.
    You can chat with us any time on
    <a class="no-underline bg-animate hover-bg-light-blue silver hover-dark-gray" href="https://webchat.freenode.net/?channels=sciencefair" target="_blank">IRC (#sciencefair on freenode.net)</a>.
  </p>
  <p class="f3 w-80-ns lh-copy ph5-ns mid-gray center">
    ScienceFair is an Open Source project. Code is licensed under the
    <a class="no-underline bg-animate hover-bg-light-blue silver hover-dark-gray" href="https://github.com/codeforscience/sciencefair/blob/master/LICENSE" target="_blank">MIT license</a>
    and hosted
    <a class="no-underline bg-animate hover-bg-light-blue silver hover-dark-gray" href="https://github.com/codeforscience/sciencefair" target="_blank">on Github</a>.
    We
    <a class="no-underline bg-animate hover-bg-light-blue silver hover-dark-gray" href="https://github.com/codeforscience/sciencefair/blob/master/CONTRIBUTING.md" target="_blank">welcome contributions</a>
    of any kind from anyone, provided you follow our
    <a class="no-underline bg-animate hover-bg-light-blue silver hover-dark-gray" href="https://github.com/codeforscience/sciencefair/blob/master/CODE_OF_CONDUCT.md" target="_blank">code of conduct</a>.
  </p>
  <div class="w-80 ph3-ns pv4 tc center">
    <div class="cf w-50-ns ph2-ns tc center">
      <div class="dib fl w-100 w-50-ns tc">
        <img src="assets/codeforscience_logo.png" alt="Code for Science"/>
      </div>
      <div class="dib fl w-100 w-50-ns tc">
        <img src="assets/fathomlabs_logo.png" alt="Fathom Labs"/>
      </div>
    </div>
    <div class="cf w-two-thirds-ns ph2-ns pv2 tc center">
      <div class="dib fl w-100 w-third-ns tc">
        <img src="assets/sciencelab_logo.png" alt="Mozilla Science Lab"/>
      </div>
      <div class="dib fl w-100 w-third-ns tc">
        <img src="assets/dat_logo.png" alt="Dat data"/>
      </div>
      <div class="dib fl w-100 w-third-ns tc">
        <img src="assets/elife_logo.png" alt="eLife Sciences"/>
      </div>
    </div>
  </div>
</section>

`
