var fs = require('fs');
var polyfill = require('./polyfills')();
var packageFinder = module.exports;
var regex = require('./regex').getRegex();

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


    jsFiles.forEach(function (jsFile) {
      //read Js files
      fs.readFile(dir + jsFile, 'utf-8', function (err, data) {
        if (err) {
          throw err;
        }

        //Store all matching packages
        packages = packages.concat(data.match(regex).map(
          filterPackageName));

        //Only track packages that need to be installed
        packagesInstall = packages.filter(pckgDeps).filter(
          pckgDevDeps);
      });
    });
  });
}


function filterPackageName(file) {
  return file.replace(regex, '$7');

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
