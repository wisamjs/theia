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

/*
 * Prompt dependencies, filter results
 * and then prompt devDependencies
 * and then ask it
 */
helper.promptUser = function (pckgs) {
  return helper.promptDeps(pckgs).then(function (depAnswers) {

    //Need remaining packages to prompt for dev dependencies
    var notChosen = helper.nonIntersect(depAnswers.dependencies);
    var remaining = pckgs.filter(notChosen);

    return helper.promptdevDeps(remaining).then(function (devDepAnswers) {
      helper.installDeps('devDependencies', devDepAnswers);
      helper.installDeps('dependencies', depAnswers);

    });
  });
};

helper.nonIntersect = function (arr) {
  return function (b) {
    return arr.indexOf(b) === -1;
  };
};


helper.promptDeps = function (pckgs) {
  var defer = Q.defer();
  var dependencies = {
    type: 'checkbox',
    message: chalk.red('Found ' + pckgs.length + ' missing packages.') +
      '\nSelect packages you want to install as dependencies:',
    name: 'dependencies',
    choices: pckgs.map(helper.makeCheckboxObject)
  };

  inquirer.prompt(dependencies, defer.resolve);

  return defer.promise;

};


helper.promptdevDeps = function (pckgs) {
  var defer = Q.defer();
  var devDependencies = {
    type: 'checkbox',
    message: chalk.red(pckgs.length + ' packages remaining.') +
      '\nSelect packages you want to install as devDependencies:',
    name: 'devDependencies',
    choices: pckgs.map(helper.makeCheckboxObject)
  };

  inquirer.prompt(devDependencies, defer.resolve);

  return defer.promise;
};

helper.userAction = function (argv, pckgs) {

  if (!argv.saveDev && !argv.save && argv.i) {
    console.log(chalk.red('Error'));
  }
  //No flags
  if (Object.keys(argv).length === 2) {
    return helper.displayMissing(pckgs);
  }

  if (argv.saveDev && argv.save) {
    return helper.promptUser(pckgs);
  }

  if (argv.saveDev && argv.i) {
    return helper.confirmInstall(pckgs);
  }

  if (argv.saveDev) {
    return helper.installDeps('devDependencies', pckgs);
  }

  if (argv.save && argv.i) {
    return helper.confirmInstall(pckgs);
  }

  if (argv.save) {
    return helper.installDeps('dependencies', pckgs);
  }

};


helper.confirmInstall = function () {
  console.log('TODO');
};


helper.displayMissing = function (pckgs) {
  console.log(chalk.red('Found ' + pckgs.length + ' missing packages:\n'));
  pckgs.map(function (pckg) {
    console.log(chalk.blue('* ' + pckg));
  });
  console.log('\n');
};

//TODO: actually install dependencies
helper.installDeps = function (type, pckgs) {
  console.log(chalk.blue('Installed ' + type + ': ' + pckgs.toString()));

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
