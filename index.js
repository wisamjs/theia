#!/usr/bin/env node

var argv = require('yargs').argv;
var packageFinder = require('./lib/package-finder.js');

packageFinder.exec(argv, process.cwd());
