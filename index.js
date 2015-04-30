var argv = require('yargs').argv;
var packageFinder = require('./lib/package-finder.js');
var path = require('path');

packageFinder.exec(argv, path.join(__dirname));
