// server.js
//
// This is the kollektor server responsible for
// - scanning given directory for existing files and their metadata
// - maintain in memory database of all files in the collection
// - serving client files for browsing your collection via web interface
// - exposing a REST API for retrieving and modifying the collection
// - watching that directory for file changes due to adding files manuall or API uploads
//
// What it doesn't do
// - sync files across multiple kollektor instances.
//   That's currently handles by 3rd party e.g. Dropbox

const commander = require('commander')
const pacakge = require('./package.json')
const express = require('express')
const debug = require('debug')
const scanDir = require('./lib/scan-dir')

// Initialize logger
debug.enable('kollektor')
const log = debug('kollektor')

// ## Command line options
//
// Server is a command line app so lets define it's interface

// We support only two options:
// - the port at which we want to run (defaults to 3000)
// - collection's directory
// Todo:
// - [ ] create folder if it doesn't exist
// - [ ] find next available port if 3000 is taken
commander
  .version(pacakge.version)
  .usage('[options] <dir>')
  .option('-p, --port [value]', 'Server port')
  .parse(process.argv)

const port = commander.port || 3000
const dir = commander.args[0]

if (!dir) {
  commander.help()
  process.exit(-1)
}

// ## Init

// Scan given folder for all images and their metadata

log(`Scanning "${dir}" for files`)
scanDir(dir, (err, items) => {
  log(`Scan complete. ${items.length} items found`)
  if (err) {
    log('ERROR', err)
    return
  }

  startServer(items)
})

// ## Server

// Now we start a web server responsible for handline API requests and serving the web interface

function startServer (items) {
  var app = express()

  app.get('/', function (req, res) {
    res.send('Hello World! ' + items.length)
  })

  app.listen(port, function () {
    log(`Starting on port http://localhost:${port}`)
  })
}
