const html = require('choo/html')
const css = require('csjs-inject')

module.exports = (state, prev, send) => {
  if (!(state.reader.visible)) return null

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

  const paper = state.reader.paper
  const xmlfile = `${paper.datasource}/articles/${paper.path}/${paper.entryfile}`
  const docurl = `http://localhost:${state.contentserver.port}/${xmlfile}`
  const lensurl = `../lib/lens/index.html?url=${encodeURIComponent(docurl)}`
  console.log(docurl, lensurl)

  var frame = html`
    <webview class="${style.frame}"></webview>
  `
  frame.disablewebsecurity = true
  frame.src = lensurl
  frame.addEventListener('dom-ready', function () {
    // uncomment line below if you want to debug the lens reader
    // frame.openDevTools()
  })

  frame.shadowRoot.applyAuthorStyles = true
  frame.shadowRoot.children[1].style.cssText = 'width: 100%; height: 100%'

  var closebtn = html`
    <img class="${style.closebtn}" src="./images/close.png">
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
