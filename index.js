var argv = require('yargs').argv;
var packageFinder = require('./lib/package-finder.js');

//TODO - use path.resolve/path.join to handle all directories/files
packageFinder.exec(argv, __dirname + '/tests/sampleProject/');
