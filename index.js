var argv = require('yargs').argv;
var packageFinder = require('./lib/package-finder.js');
packageFinder.exec(argv, './tests/sampleProject/');
