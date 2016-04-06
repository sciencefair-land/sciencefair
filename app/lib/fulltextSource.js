// var gravityWell = require('gravity-well')()
var gravityWell = function(){}
var Download = require('download')
var datapath = require('path').resolve('data')

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
  var dl = new Download({ extract: true, mode: '755' })

  dl.get(`${baseurl}/${paper.pmcid}/fullTextXML`)
    .get(`${baseurl}/${paper.pmcid}/supplementaryFiles`)
    .dest(output)
    .rename(function(file) {
      file.dirname += `/${paper.pmcid}`
      if (/fullTextXML/.test(file.basename)) {
        file.basename = 'fulltext'
        file.extname = '.xml'
      } else {
        file.dirname += '/figures'
      }
      return file
    })
    .run(cb)
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
