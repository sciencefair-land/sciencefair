const html = require('choo/html')
const css = require('csjs-inject')
const cache = require('cache-element')
const open = require('open')

const reader = (port, paper, send) => {
  console.log('(re-)rendering reader')

  const margin = 0
  const marginTopShim = 30

  const style = css`

  .readerframe {
    position: fixed;
    left: ${margin}px;
    top: ${margin + marginTopShim}px;
    bottom: ${margin};
    right: ${margin};
    z-index: 3000;
    border: none;
  }

  .frame {
    width: 100%;
    height: 100%;
    display: block;
  }

  .closebtn {
    z-index: 3001;
    width: 30px;
    height: 30px;
    position: fixed;
    right: 5px;
    top: 35px;
  }

  `

  const xmlfile = `${paper.source}/articles/${paper.path}/${paper.entryfile}`
  const docurl = `http://localhost:${port}/${xmlfile}`
  const lensurl = `../app/lib/lens/index.html?url=${encodeURIComponent(docurl)}`

  const frame = html`<webview class="${style.frame}"></webview>`

  frame.disablewebsecurity = true
  frame.src = lensurl
  frame.addEventListener('dom-ready', function () {
    // uncomment line below if you want to debug the lens reader
    // frame.openDevTools()
  })

  frame.shadowRoot.applyAuthorStyles = true
  frame.shadowRoot.children[1].style.cssText = 'width: 100%; height: 100%'

  frame.addEventListener('new-window', (event, url) => {
    event.preventDefault()
    open(event.url)
  })

  var closebtn = html`
    <img class="${style.closebtn}" src="./images/close.svg">
  `

  closebtn.onclick = (e) => {
    e.stopPropagation()
    send('read_none')
  }

  return html`
    <div class="${style.readerframe}">
      ${closebtn}
      ${frame}
    </div>
  `
}

function Reader () {
  return cache(reader)
}

const cachedreader = Reader()

module.exports = (state, prev, send) => {
  if (!(state.reader.visible)) return null

  return cachedreader(state.contentserver.port, state.reader.paper, send)
}
