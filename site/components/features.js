const section = require('./section')
const h1 = require('./h1')

const a = require('./a')
const featurelist = require('./featurelist')
const feature = require('./feature')

const entries = [
  {
    txt: 'Modern, search-driven user interace',
    detail: 'ScienceFair uses blazing-fast search to help you find and filter the literature you need',
    img: './assets/screenshots/home.png'
  },
  {
    txt: 'A reader optimised for science',
    detail: 'Instead of static PDFs, ScienceFair uses the eLife Lens reader for a rich reading experience that helps you navigate and interpret scientific papers better',
    img: './assets/screenshots/reader.png'
  },
  {
    txt: 'Instant multi-source search',
    detail: 'Search your own library and any number of distributed literature collections simultanously - the results are seamlessly merged as they stream in from the peer-to-peer network',
    img: './assets/screenshots/results.png'
  },
  {
    txt: 'Built-in bibliometrics and analytics',
    detail: 'Results are automatically data-mined in real-time, giving you a live updating dashboard you can use to analyse the literature and refine your discovery process',
    img: './assets/screenshots/selection.png'
  }
]

const content = opts => [
  h1({ content: 'Features', dark: !opts.dark }),
  featurelist({ entries: entries })
]

module.exports = opts => section({
  section: 'features',
  dark: true,
  content: content({ dark: true })
})
