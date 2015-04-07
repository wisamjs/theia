var Q = require('q');
var polyfill = require('./polyfills')();
var fs = require('fs');
var helper = module.exports;
var regex = require('./regex').getRegex();
var dir = './sampleProject/';

var packageFile = require('.' + dir + 'package');


//Get current dependencies from Package.json
var dependencies = packageFile.dependencies;
var devDependencies = packageFile.devDependencies;

helper.promptUser = function (data) {
  console.log(data);

};

helper.readAndExtract = function (jsFiles, dir) {
  return Q.all(jsFiles.map(function (jsFile) {
    //read Js files
    return Q.nfcall(fs.readFile, dir + jsFile, 'utf-8').then(
      extractPackages)

  })).then(combinePackages);

};

function extractPackages(data) {
  // //Store all matching packages
  var packages = data.match(regex).map(
    filterPackageName);
  return packages.filter(pckgDeps).filter(
    pckgDevDeps);

  //Only track packages that need to be installed
  return packagesInstall;
};

function filterPackageName(file) {
  return file.replace(regex, '$7');

};

function combinePackages(arr) {
  return arr.reduce(function (prevArr, currArr) {
    return prevArr.concat(currArr);
  });
};

//returns true if pckg is property of dependecies
function pckgDeps(pckg) {
  return !dependencies.hasOwnProperty(pckg);
};

//returns true if pckg is property of devDependecies
function pckgDevDeps(pckg) {
  return !devDependencies.hasOwnProperty(pckg)
};

helper.isJavaScript = function (file) {
  return file.endsWith('.js');

};
