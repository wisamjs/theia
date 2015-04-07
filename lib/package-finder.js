var fs = require('fs');
var polyfill = require('./polyfills')();
var packageFinder = module.exports;
var regex = require('./regex').getRegex();
var Q = require('q');

var dir = './sampleProject/';
var packageFile = require('.' + dir + 'package');

//Get current dependencies from Package.json
var dependencies = packageFile.dependencies;
var devDependencies = packageFile.devDependencies;

var packages = [];
var packagesInstall = [];


packageFinder.exec = function () {
  var data = {};

  //read entire directory
  fs.readdir(dir, function (err, files) {
    if (err) {
      throw err
    };
    var jsFiles = files.filter(isJavaScript);
    readAndExtract(jsFiles).then(promptUser);
  });
}

function promptUser(data) {
  console.log(data);

};

function readAndExtract(jsFiles) {
  return Q.all(jsFiles.map(function (jsFile) {
    //read Js files
    return Q.nfcall(fs.readFile, dir + jsFile, 'utf-8').then(
      extractPackages)

  })).then(combinePackages);

};

function extractPackages(data) {
  // //Store all matching packages
  packages = data.match(regex).map(
    filterPackageName);

  //Only track packages that need to be installed
  return packages.filter(pckgDeps).filter(
    pckgDevDeps);
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

function isJavaScript(file) {
  return file.endsWith('.js');

};
