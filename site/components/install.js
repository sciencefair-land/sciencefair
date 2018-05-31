const html = require('choo/html')

const version = require('../../package.json').version
const section = require('./section')
const h1 = require('./h1')
const p = require('./p')
const a = require('./a')
const dlbtns = require('./dlbtns')

const repo = 'https://github.com/codeforscience/sciencefair'
const releases = repo + '/releases'

module.exports = opts => section({
  section: 'install',
  dark: false,
  content: [
    h1({ content: 'Install', dark: true }),
    p({ content: html`
      <span>
        Latest version: <code>v${version}</code>
        <small>
          ${a({ href: releases, content: html`<span>(see previous versions)</span>` })}
        </small>
      </span>
      `,
      dark: true
    }),
    dlbtns(),
    p({ content: html`
      <span>
        Or you can explore ${a({ href: repo, content: 'the source code on GitHub' })}
      </span>
      `,
      dark: true
    })
  ]
})
