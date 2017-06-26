const html = require('choo/html')

module.exports = opts => {
  const shade = opts.dark ? 'dark' : 'light'
  return html`<h1 class="w-100 ${shade}-gray f2 tc">${opts.content}</h1>`
}
