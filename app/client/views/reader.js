const html = require('choo/html')
const css = require('csjs-inject')
const open = require('opn')

const getpaper = require('../lib/getpaper')
const contentserver = require('../lib/contentserver')
const imgpath = require('../lib/imgpath')

const reader = (state, emit) => {
  const paper = state.reading.paper

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

  const xmlfile = `${paper.source}/article_feed${paper.path}/${paper.entryfile}`
  const docurl = contentserver.resolve(xmlfile)
  const lensurl = `file://${__dirname}/../lib/lens/index.html?url=${encodeURIComponent(docurl)}`
  const frame = html`<webview class="${style.frame}"></webview>`

  frame.disablewebsecurity = true
  frame.src = lensurl
  frame.addEventListener('dom-ready', () => {
    // uncomment line below if you want to debug the lens reader
    // frame.openDevTools()
  })

  frame.shadowRoot.applyAuthorStyles = true
  frame.shadowRoot.children[1].style.cssText = 'width: 100%; height: 100%'

  frame.addEventListener('new-window', e => {
    e.preventDefault()
    open(e.url)
  })

  const closebtn = html`<img class="${style.closebtn}">`
  closebtn.src = imgpath('close.svg')
  closebtn.onclick = e => {
    e.stopPropagation()
    emit('reader:quit')
  }

  return require('./mainwrapper')(state, emit, html`

  <div class="${style.readerframe}">
    ${closebtn}
    ${frame}
  </div>

  `)
}

module.exports = reader
