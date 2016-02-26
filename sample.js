var subsets = require('random-subsets')
var fs = require('fs')
var sqlite  = require('sqlite3')

var path = './app/db/sample.sqlite'
try {
  if (fs.readFileSync(path)) fs.unlink(path)
} catch (err) {}

var db = new sqlite.Database(path)

var titles = ['biology', 'awesome', 'science', 'discovery', 'brain', 'genome', 'dna', 'virus', 'code', 'bacteria']
var authors = ['hubel', 'wiesel', 'watson', 'franklin', 'lovelace', 'turing']

db.serialize(function() {
  db.run("CREATE VIRTUAL TABLE Papers USING fts4(id INT, author TEXT, title TEXT)")
  var stmt = db.prepare("INSERT INTO Papers (id, author, title) VALUES (:id, :author, :title)");
  
  for (var i = 0; i < 100; i++) {
    stmt.run(
      i,
      subsets(authors, parseInt(Math.random() * 5) + 1)[0].join(' '), 
      subsets(titles, parseInt(Math.random() * 2) + 2)[0].join(' ')
    )
  }
  
  stmt.finalize()

  db.each("SELECT rowid AS id, author, title FROM Papers", function(err, row) {
    console.log(row)
  })

  var statement= "SELECT * FROM Papers WHERE title MATCH 'biology' ORDER BY id"
  db.each(statement, function (err, result) {
    console.log(result)
  })
})
