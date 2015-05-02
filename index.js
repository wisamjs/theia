#!/usr/bin/env node

var argv = require('yargs').argv;
var theia = require('./lib/theia.js');

theia.exec(argv, process.cwd());
