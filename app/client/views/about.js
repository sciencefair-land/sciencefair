const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../lib/constants')

const open = require('opn')

const overlay = require('./overlay')
const pkgjson = require('../../package.json')
const icon = require('./icon')

const style = css`

.content {
  width: 100%;
  box-sizing: border-box;
  padding: 20px;
  font-size: 1.6em;
  font-family: CooperHewitt-Book;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.content p {
  display: block;
  margin: 0;
}

.content a {
  text-decoration: none;
  color: ${C.GREYBLUE}}
}

.content a:hover {
  text-decoration: none;
  color: ${C.DARKBLUE}
}

.community {
  font-size: 0.8em;
}

.header {
  font-family: Aleo-Light;
  width: 100%;
  justify-content: space-between;
}

.version {
  font-size: 0.9em;
  align-self: center;
}

.cards {
  width: 100%;
  flex-direction: row;
  justify-content: center;
  margin-bottom: 20px;
}

.card {
  box-sizing: border-box;
  width: 100px;
  height: 100px;
  padding: 10px;
  margin: 10px;
  font-size: 0.8em;
  align-items: center;
  justify-content: space-around;
  flex-direction: column;
}

`

const geticon = name => icon({
  name: name,
  backgroundColor: C.DARKBLUE,
  width: 80,
  height: 80
})

module.exports = (state, emit) => {
  if (!state.aboutshown) return null

  const title = html`

  <div class="${style.header}">
    ${require('./logo')()}
    <span class="${style.version}">v${pkgjson.version}</span>
  </div>

  `

  const code = html`

  <div class="${style.card} clickable">
    ${geticon('code')}
    code
  </div>

  `
  code.onclick = () => open('https://github.com/codeforscience/sciencefair')

  const website = html`

  <div class="${style.card} clickable">
    ${geticon('home')}
    website
  </div>

  `
  website.onclick = () => open('https://codeforscience.com/sciencefair')

  const chat = html`

  <div class="${style.card} clickable">
    ${geticon('chat')}
    chat
  </div>

  `
  chat.onclick = () => open('https://webchat.freenode.net/?channels=sciencefair')

  const codeforscience = html`<span class="clickable">Code For Science and Society</span>`
  codeforscience.onclick = () => open('https://codeforscience.org/')

  const about = html`

  <div class="${style.content}">
    <div class="${style.cards}">
      ${code}
      ${website}
      ${chat}
    </div>

    <p class="${style.community}">Made with ♥ by the ${codeforscience} community</p>
  </div>

  `

  about.onclick = e => {
    // don't trigger toggle when user clicks on the popup
    e.preventDefault()
    e.stopPropagation()
  }

  const onclick = e => {
    // trigger toggle when user clicks on the overlay
    e.preventDefault()
    emit('about:hide')
  }

  return overlay(state, emit, {
    title: title,
    content: about,
    onclick: onclick
  })
}
