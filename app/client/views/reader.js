const html = require('choo/html')
const css = require('csjs-inject')
const open = require('electron').shell.openExternal
const { ipcRenderer } = require('electron')
const imgpath = require('../lib/imgpath')

const reader = (state, emit) => {
  const paper = state.reading

  const margin = 0
  const marginTopShim = 30

  const style = css`

  .reader {
    background-color: white;
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

  const closebtn = html`<img class="${style.closebtn}">`
  closebtn.src = imgpath('close.svg')
  closebtn.onclick = e => {
    e.stopPropagation()
    emit('reader:quit')
  }

  const xmlfile = `${paper.source}/article_feed${paper.path}/${paper.entryfile}`
  const docurl = ipcRenderer.sendSync('contentserver:resolve', xmlfile)
  const lensurl = `file://${__dirname}/../lib/lens/index.html?url=${encodeURIComponent(docurl)}`

  const frame = html`<webview id="reader" class="${style.frame}"></webview>`
  frame.disablewebsecurity = true
  frame.src = lensurl
  frame.shadowRoot.applyAuthorStyles = true
  frame.shadowRoot.children[1].style.cssText = 'width: 100%; height: 100%;'

  frame.addEventListener('new-window', e => {
    e.preventDefault()
    open(e.url)
  })

  const readerframe = require('./mainwrapper')(state, emit, html`

  <div id="reader-frame" class="${style.reader}">
    ${closebtn}
    ${frame}
  </div>

  `)

  return readerframe
}

module.exports = reader
