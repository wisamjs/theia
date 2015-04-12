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


function promptUser(pckgs) {
  return promptDeps(pckgs).then(function (depAnswers) {

    //Need remaining packages to prompt for dev dependencies
    var notChosen = nonIntersect(depAnswers.dependencies);
    var remaining = pckgs.filter(notChosen);

    return promptdevDeps(remaining).then(function (devDepAnswers) {
      installDeps('devDependencies', devDepAnswers);
      installDeps('dependencies', depAnswers);

    });
  });
}

function nonIntersect(arr) {
  return function (b) {
    return arr.indexOf(b) === -1;
  };
}


function promptDeps(pckgs) {
  var defer = Q.defer();
  var dependencies = {
    type: 'checkbox',
    message: chalk.red('Found ' + pckgs.length + ' missing packages.') +
      '\nSelect packages you want to install as dependencies:',
    name: 'dependencies',
    choices: pckgs.map(makeCheckboxObject)
  };

  inquirer.prompt(dependencies, defer.resolve);

  return defer.promise;

}


function promptdevDeps(pckgs) {
  var defer = Q.defer();
  var devDependencies = {
    type: 'checkbox',
    message: chalk.red(pckgs.length + ' packages remaining.') +
      '\nSelect packages you want to install as devDependencies:',
    name: 'devDependencies',
    choices: pckgs.map(makeCheckboxObject)
  };

  inquirer.prompt(devDependencies, defer.resolve);

  return defer.promise;
}

helper.userAction = function (argv) {
  return function (pckgs) {

    if (!argv.saveDev && !argv.save && argv.i) {
      console.log(chalk.red('Error'));
    }
    //No flags
    if (Object.keys(argv).length === 2) {
      return displayMissing(pckgs);
    }

    if (argv.saveDev && argv.save) {
      return promptUser(pckgs);
    }

    if (argv.saveDev && argv.i) {
      return confirmInstall(pckgs);
    }

    if (argv.saveDev) {
      return installDeps('devDependencies', pckgs);
    }

    if (argv.save && argv.i) {
      return confirmInstall(pckgs);
    }

    if (argv.save) {
      return installDeps('dependencies', pckgs);
    }

  };

};


function confirmInstall() {
  console.log('TODO');
}


function displayMissing(pckgs) {
  console.log(chalk.red('Found ' + pckgs.length + ' missing packages:\n'));
  pckgs.map(function (pckg) {
    console.log(chalk.blue('* ' + pckg));
  });
  console.log('\n');
}

//Installs all pckgs
function installDeps(type, pckgs) {
  console.log(chalk.blue('Installed ' + type + ': ' + pckgs.toString()));

}


function makeCheckboxObject(pckg) {
  return {
    name: pckg,
    checked: false
  };

}

/*
 * Reads all files in Jsfiles,
 * extracts all packages in each file
 * and returns a list of package names
 */

helper.readAndExtract = function (jsFiles) {
  return Q.all(jsFiles.map(function (jsFile) {
    //read Js files
    return Q.nfcall(fs.readFile, dir + jsFile, 'utf-8').then(
      extractPackages);

  })).then(flatten);

};

function extractPackages(data) {
  // //Store all matching packages
  var packages = data.match(regex).map(
    replaceWithName);
  var uniqueDeps = isNotObjProp(pckgJson.dependencies);
  var uniqueDevDeps = isNotObjProp(pckgJson.devDependencies);

  //Only track packages that need to be installed
  return packages.filter(uniqueDeps).filter(uniqueDevDeps);

}

//Replaces the regex with the name of the package.
function replaceWithName(file) {
  return file.replace(regex, '$7');
}

//Takes a multi-dimensional array and returns
//a single array
function flatten(arr) {
  return arr.reduce(function (prevArr, currArr) {
    return prevArr.concat(currArr);
  });
}


//Returns true if pckg is a property of obj.
function isObjProp(obj, pckg) {
  return obj.hasOwnProperty(pckg);

}

/*Returns a function
 * that returns false if
 * pckg is an object property of obj.
 */
function isNotObjProp(obj) {
  return function (pckg) {
    return !isObjProp(obj, pckg);
  };

}

//Returns true if file has a js extension
helper.isJavaScript = function (file) {
  return file.endsWith('.js');
};
