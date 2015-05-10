'use strict';

require('./polyfills');
var Q = require('q');
var fs = require('fs');
var regex = require('./regex').getRegex();
var inquirer = require('inquirer');
var chalk = require('chalk');
var npm = require('npm');
var pckgJson;

var DEVCONFIG = {
  'save-dev': true,
  'save': false
};

var CONFIG = {
  'save-dev': false,
  'save': true
};

module.exports = function () {
  return {
    isJavaScript: isJavaScript,
    userAction: userAction,
    readAndExtract: readAndExtract,
    isFile: isFile,
    flatten: flatten,
    readDir: readDir,
    readPckgJson: readPckgJson,
    getFiles: getFiles,
    ignoredDirs: ignoredDirs
  };


}();

//Takes a multi-dimensional array and returns
//a single array
function flatten(arr) {
  return arr.reduce(function (prevArr, currArr) {
    return prevArr.concat(currArr);
  });
}


function readPckgJson(path) {
  pckgJson = require(path);


}

//Returns an array of file names
function getFiles(results) {
  return Q.all(results.map(isFile)).
  then(function (fileResults) {
    return results.filter(function (file, index) {
      return fileResults[index];
    });
  });

}


function promptUser(pckgs) {
  return prompt('save', pckgs).then(function (depAnswers) {

    var selectedDeps = nonIntersect(depAnswers);
    var remaining = pckgs.filter(selectedDeps);

    if (remaining) {
      return prompt('save-dev', remaining).then(function (
        devDepAnswers) {

        var allSelected = nonIntersect(depAnswers.concat(
          devDepAnswers));
        var remainingPckgs = pckgs.filter(allSelected);

        return handleRemaining(remainingPckgs).then(function () {
          installAll(depAnswers, devDepAnswers);
        });

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

function handleRemaining(pckgs) {

  if (pckgs.length > 0) {
    return confirmSkip(pckgs);
  } else {
    return Q.when();
  }
}

function installAll(depAnswers, devDepAnswers) {
  return installDeps(depAnswers)
    .then(function () {
      return installDevDeps(devDepAnswers);
    });

}

function makeUnique(arr) {
  return arr.filter(function (elem, pos) {
    return arr.indexOf(elem) === pos;
  });

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

function confirmSkip(pckgs) {
  var defer = Q.defer();
  var question = {
    type: 'confirm',
    name: 'skip',
    message: 'Skipping the following packages?' + ' :\n ' + chalk.blue('* ' +
      pckgs.join(
        '\n * ')) + '\n Continue?',
    default: false
  };

  inquirer.prompt(question, function (answer) {
    if (answer.skip) {
      return defer.resolve();
    }
    return defer.reject();

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

    if (pckgs.length === 0) {
      console.log(chalk.green('No missing packages found!'));
      return 0;

    }

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


  console.log(chalk.red('Found ' + pckgs.length + ' missing packages:\n'));
  pckgs.map(function (pckg) {
    console.log(chalk.blue('* ' + pckg));
  });
  console.log('\n');
}

function installDevDeps(pckgs) {
  return install(DEVCONFIG)(pckgs);
}

function installDeps(pckgs) {
  return install(CONFIG)(pckgs);
}

//Installs all pckgs
function install(config) {

  return function (pckgs) {
    var defer = Q.defer();

    npm.load(config, function (err) {
      if (pckgs.length > 2) {
        npm.config.set('save', false);
        npm.config.set('save-dev', true);
      }
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
      return readFile(jsFile)
        .then(extractPackages);
    })).then(flatten)
    .then(makeUnique);

}

//Promisified version of fs.readFile
function readFile(file) {
  return Q.nfcall(fs.readFile, file, 'utf-8');
}

//Promisified version fs.readDir
function readDir(dir) {
  return Q.nfcall(fs.readdir, dir);
}

function extractPackages(data) {
  // //Store all matching packages

  // if no matches, use empty array
  var regexMatch = data.match(regex) || [];
  var packages = regexMatch.map(
    replaceWithName);
  var uniqueDeps = isNotObjProp(pckgJson.dependencies || []);
  var uniqueDevDeps = isNotObjProp(pckgJson.devDependencies || []);

  //Only track packages that need to be installed
  return packages.filter(uniqueDeps).filter(uniqueDevDeps).filter(
    installablePckg);

}

//Replaces the regex with the name of the package.
function replaceWithName(file) {
  return file.replace(regex, '$2');
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

// Returns true if package is a directory that should be ignored
function ignoredDirs(dir) {
  var dirs = ['.git', 'node_modules', 'bower_components'];
  return dirs.indexOf(dir) === -1;

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

function isFile(file) {
  return Q.nfcall(fs.stat, file)
    .then(function (stats, error) {
      if (error) {
        return error;
      }
      return stats.isFile();
    });
}
