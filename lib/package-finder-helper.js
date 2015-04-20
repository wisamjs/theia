'use strict';

require('./polyfills');
var Q = require('q');
var fs = require('fs');
var regex = require('./regex').getRegex();
var dir = './sampleProject/';
var inquirer = require('inquirer');
var chalk = require('chalk');
var npm = require('npm');

module.exports = function () {
  return {
    isJavaScript: isJavaScript,
    userAction: userAction,
    readAndExtract: readAndExtract
  };


}();

//Takes a multi-dimensional array and returns
//a single array
function flatten(arr) {
  return arr.reduce(function (prevArr, currArr) {
    return prevArr.concat(currArr);
  });
}


var pckgJson = require('.' + dir + 'package');


function promptUser(pckgs) {
  return prompt('save', pckgs).then(function (depAnswers) {

    var selectedDeps = nonIntersect(depAnswers);
    var remaining = pckgs.filter(selectedDeps);

    if (remaining) {
      return prompt('save-dev', remaining).then(function (
        devDepAnswers) {

        var allSelected = nonIntersect(depAnswers.concat(
          devDepAnswers));
        var stillRemaining = pckgs.filter(allSelected);
        if (stillRemaining.length) {

          //TODO
          return confirmInstall();
        } else {
          installDeps(depAnswers).then(function () {
            installDevDeps(devDepAnswers);
          });
        }
      });
    } else {
      return installDeps(pckgs);
    }
  });
}

function nonIntersect(arr) {
  return function (b) {
    return arr.indexOf(b) === -1;
  };
}


function prompt(option, pckgs) {
  var type;
  if (option === 'save-dev') {
    type = 'devDependencies';
  } else {
    type = 'dependencies';
  }
  var defer = Q.defer();
  var question = {
    type: 'checkbox',
    message: chalk.red('Found ' + pckgs.length + ' missing packages.') +
      '\nSelect packages you want to install as ' + type + ':',
    name: 'selected',
    choices: pckgs.map(makeCheckboxObject)
  };

  inquirer.prompt(question, function (answer) {
    defer.resolve(answer.selected);
  });

  return defer.promise;
}

function confirmInstall(type, pckgs) {
  var defer = Q.defer();
  var questions = {
    type: 'confirm',
    name: 'toInstall',
    message: 'npm install --' + type + ' :\n ' + chalk.blue('* ' +
      pckgs.join(
        '\n * ')) + '\n Continue?',
    default: false
  };

  inquirer.prompt(questions,
    function (answer) {
      if (!answer.toInstall) {
        defer.reject();
      }
      defer.resolve(pckgs);


    });
  return defer.promise;
}

function userAction(argv) {
  return function (pckgs) {

    if (!argv.saveDev && !argv.save && argv.i) {
      return 'Error';
    }
    //No flags
    if (Object.keys(argv).length === 2) {
      return displayMissing(pckgs);
    }

    if (argv.saveDev && argv.save) {
      return promptUser(pckgs);
    }

    if (argv.saveDev && argv.i) {

      return confirmInstall('save-dev', pckgs).then(installDevDeps);
    }

    if (argv.saveDev) {
      return installDevDeps(pckgs);
    }

    if (argv.save && argv.i) {
      return confirmInstall('save', pckgs).then(installDeps);
    }

    if (argv.save) {
      return installDeps(pckgs);
    }

  };

}


function displayMissing(pckgs) {
    /*eslint-disable no-console*/
    console.log(chalk.red('Found ' + pckgs.length + ' missing packages:\n'));
    pckgs.map(function (pckg) {
      console.log(chalk.blue('* ' + pckg));
    });
    console.log('\n');
  }
  /*eslint-enable no-console*/

function installDevDeps(pckgs) {
  return install('save-dev')(pckgs);
}

function installDeps(pckgs) {
  return install('save')(pckgs);
}

//Installs all pckgs
function install(type) {
  return function (pckgs) {
    var defer = Q.defer();
    var config = {};
    config[type] = true;

    npm.load(config, function (err) {
      if (err) {
        defer.reject(err);
      }
      npm.commands.install(pckgs, function (errMsg) {
        if (errMsg) {
          defer.reject(err);
        }
        defer.resolve();
      });
    });

    return defer.promise;
  };
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

function readAndExtract(jsFiles) {
  return Q.all(jsFiles.map(function (jsFile) {
    //read Js files
    return Q.nfcall(fs.readFile, dir + jsFile, 'utf-8').then(
      extractPackages);

  })).then(flatten);

}

function extractPackages(data) {
  // //Store all matching packages
  var packages = data.match(regex).map(
    replaceWithName);
  var uniqueDeps = isNotObjProp(pckgJson.dependencies);
  var uniqueDevDeps = isNotObjProp(pckgJson.devDependencies);

  //Only track packages that need to be installed
  return packages.filter(uniqueDeps).filter(uniqueDevDeps).filter(
    installablePckg);

}

//Replaces the regex with the name of the package.
function replaceWithName(file) {
  return file.replace(regex, '$7');
}


//Returns true if pckg is a property of obj.
function isObjProp(obj, pckg) {
  return obj.hasOwnProperty(pckg);

}

//Returns true if package is not a built in node package
//and therefore installable.
function installablePckg(pckg) {
  var packages = ['assert', 'buffer', 'child_process', 'cluster',
    'crypto', 'dgram', 'dns', 'domain', 'events', 'fs', 'http', 'https',
    'net',
    'os', 'path', 'punycode', 'querystring', 'readline', 'stream',
    'string_decoder', 'tls', 'tty', 'url', 'util', 'vm', 'zlib', 'smalloc'
  ];
  return packages.indexOf(pckg) === -1;

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
function isJavaScript(file) {
  return file.endsWith('.js');
}
