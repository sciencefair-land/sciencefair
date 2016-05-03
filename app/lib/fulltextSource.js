// var gravityWell = require('gravity-well')()
var gravityWell = function(){}
var Download = require('download')

function FulltextSource(source, datadir) {
  if (!(this instanceof FulltextSource)) return new FulltextSource(source)

  Object.assign(this, source)
  this.datadir = datadir
  this.parts = _.toPairsIn(this.datHash).map(extractPart)
  this.downloaders = _.fromPairs(this.parts.map(getWell))
}

// Given an array containing a key-value pair
// where the key is a string link name like:
//   firstID_lastID
// and the value is a hyperdrive link, return an
// object describing the dataset part like:
// {
//   from: String (first paper ID in the dataset part)
//   to: String (last paper ID in the dataset part)
//   link: String (hexadecimal hyperdrive/dat link)
// }
function extractPart(pair) {
  var range = pair[0].split('_')
  return {
    from: range[0].toLowerCase(),
    to: range[1].toLowerCase(),
    link: pair[1]
  }
}

// Given an object with a `link` property, return
// an array containing the object and a gravity well
// for the link
function getWell(part) {
  return [part, gravityWell(part)]
}

// Sync the metadata for every hyperdrive loaded.
// call `cb` when all have completed
FulltextSource.prototype.syncMetadata = function(cb) {
  var done = _.after(this.downloaders.length, cb)
  this.downloaders.forEach((downloader) => {
    downloader.syncMetadata(done)
  })
}

FulltextSource.prototype.downloadPaperHTTP = function(paper, cb) {
  var baseurl = 'http://www.ebi.ac.uk/europepmc/webservices/rest'
  var output = path.join(datadir, 'eupmc_fulltexts')

  function done(err, files, other) {
    paper.downloadFinished(err, files, other)
    if (cb) cb(err, files, other)
  }

  new Download({ extract: true, mode: '755' })
    .get(`${baseurl}/${paper.getId('pmcid')}/fullTextXML`)
    .dest(output)
    .rename(function(file) {
      file.dirname += `/${paper.getId('pmcid')}`
      file.basename = 'fulltext'
      file.extname = '.xml'
      return file
    })
    .use((res, url) => { paper.downloading(res, url, 'xml') })
    .run(done)

  new Download({ extract: true, mode: '755' })
    .get(`${baseurl}/PMC/${paper.getId('pmcid')}/textMinedTerms//1/1000/json`)
    .dest(output)
    .rename(function(file) {
      file.dirname += `/${paper.getId('pmcid')}`
      file.basename = 'textMinedTerms'
      file.extname = '.json'
      return file
    })
    .use((res, url) => { paper.downloading(res, url, 'terms') })
    .run(done)
  //
  // dl.get(`${baseurl}/${paper.getId('pmcid')}/fullTextXML`)
  //   .dest(output)
  //   .rename(function(file) {
  //     file.dirname += `/${paper.getId('pmcid')}`
  //     file.basename = 'fulltext'
  //     file.extname = '.pdf'
  //     return file
  //   })
  //   .use((res, url) => { paper.downloading(res, url, 'pdf') })
  //   .run()
  //
  new Download({ extract: true, mode: '755' })
    .get(`${baseurl}/${paper.getId('pmcid')}/supplementaryFiles`)
    .dest(output)
    .rename(function(file) {
      file.dirname += `/${paper.getId('pmcid')}/figures`
      return file
    })
    .use((res, url) => { paper.downloading(res, url, 'supp') })
    .run(done)

}

// Given a Paper find the corresponding dataset part
// search its metadata for the requested file and
// download that file.
// Returns a download object, which emits events
// when the download makes progress, completes or errors
FulltextSource.prototype.downloadPaper = function(paper) {
  var part = this.partForPaper(paper)

  if (part === null) return null

  var dl = this.downloaders[part].downloadByName(paper.filePath)

  return dl
}

// Given a paper, return the corresponding dataset part
// or null if there is no corresponding part in the source
FulltextSource.prototype.partForPaper = function(paper) {
  var matches = this.parts.filter((part) => {
    return (part.from <= paper.pmcid) && (paper.pmcid <= part.to)
  })

  return matches[0] || null
}

module.exports = FulltextSource
