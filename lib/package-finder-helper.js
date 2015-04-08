'use strict';
var Q = require('q');
var polyfill = require('./polyfills')();
var fs = require('fs');
var helper = module.exports;
var regex = require('./regex').getRegex();
var dir = './sampleProject/';

var pckgJson = require('.' + dir + 'package');


helper.promptUser = function (data) {
  console.log(data);

};

helper.readAndExtract = function (jsFiles, dir) {
  return Q.all(jsFiles.map(function (jsFile) {
    //read Js files
    return Q.nfcall(fs.readFile, dir + jsFile, 'utf-8').then(
      helper.extractPackages)

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
  })

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

}

helper.isJavaScript = function (file) {
  return file.endsWith('.js');

};
