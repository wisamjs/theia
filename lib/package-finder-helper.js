'use strict';

var Q = require('q');
var polyfill = require('./polyfills');
var fs = require('fs');
var helper = module.exports;
var regex = require('./regex').getRegex();
var dir = './sampleProject/';
var inquirer = require('inquirer');
var chalk = require('chalk');
polyfill();


var pckgJson = require('.' + dir + 'package');

helper.promptUser = function (pckgs) {
  var dependencies = {
    type: 'checkbox',
    message: chalk.red('Found ' + pckgs.length + ' missing packages.') +
      '\nSelect packages you want to install as dependencies:',
    name: 'dependencies',
    choices: pckgs.map(helper.makeCheckboxObject)
  };

  inquirer.prompt(dependencies, function (depChoices) {

    helper.installDeps(depChoices);

    return helper.promptdevDeps(
      pckgs.filter(function (pckg) {
        return depChoices.dependencies.indexOf(pckg) === -1;

      }));
  });

};

//TODO: actually install dependencies
helper.installDeps = function (deps) {
  console.log(chalk.blue('Installed Dependencies: ' + deps.toString()));

};

helper.promptdevDeps = function (pckgs) {
  var devDependencies = {
    type: 'checkbox',
    message: chalk.red(pckgs.length + ' packages remaining.') +
      '\nSelect packages you want to install as devDependencies:',
    name: 'devDependencies',
    choices: pckgs.map(helper.makeCheckboxObject)
  };

  inquirer.prompt(devDependencies, function (devDepsChoices) {
    helper.installDeps(devDepsChoices);
  });
};


helper.makeCheckboxObject = function (pckg) {
  return {
    name: pckg,
    checked: false
  };

};

helper.readAndExtract = function (jsFiles) {
  return Q.all(jsFiles.map(function (jsFile) {
    //read Js files
    return Q.nfcall(fs.readFile, dir + jsFile, 'utf-8').then(
      helper.extractPackages);

  })).then(helper.combinePackages);

};

helper.extractPackages = function (data) {
  // //Store all matching packages
  var packages = data.match(regex).map(
    helper.filterPackageName);

  //Only track packages that need to be installed
  return packages.filter(function (pckg) {
    return !helper.isObjectProperty(pckgJson.dependencies, pckg);
  }).filter(function (pckg) {
    return !helper.isObjectProperty(pckgJson.devDependencies, pckg);
  });

};

helper.filterPackageName = function (file) {
  return file.replace(regex, '$7');
};

helper.combinePackages = function (arr) {
  return arr.reduce(function (prevArr, currArr) {
    return prevArr.concat(currArr);
  });
};


helper.isObjectProperty = function (obj, pckg) {
  return obj.hasOwnProperty(pckg);

};

helper.isJavaScript = function (file) {
  return file.endsWith('.js');

};
