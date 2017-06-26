const choo = require('choo')

const app = choo()

app.route('/', require('./components/home'))

const rendered = `

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>ScienceFair</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="author" content="Fathom Labs" />
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="assets/logo.png" rel="icon" type="image/png" />
    <link rel="stylesheet" href="https://unpkg.com/tachyons@4.7.0/css/tachyons.min.css" />
  </head>
  ${app.toString('/')}
</html>

`

require('fs').writeFileSync('./dist/index.html', rendered)
