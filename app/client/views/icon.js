const html = require('choo/html')
const css = require('csjs-inject')
const C = require('../../constants')
const imgpath = require('../lib/imgpath')

module.exports = opts => {
  const style = css`

  .icon {
    width: ${opts.width || 30}px;
    height: ${opts.height || 30}px;
    background-color: ${opts.backgroundColor || C.LIGHTGREY};
    -webkit-mask: url(${imgpath(`${opts.name}.svg`)}) center / contain no-repeat;
    margin-top: -2px;
  }

  `
  return html`<div class="${style.icon}" />`
}
