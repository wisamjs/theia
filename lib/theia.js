'use strict';

var helper = require('./theia-helper');
var Q = require('q');
var chalk = require('chalk');
var path = require('path');

module.exports = function () {

  function readAllDirs(dir) {


    //read current directory
    return helper.readDir(dir).then(function (results) {

      //ignore node_modules folder if it exists
      results = results.filter(helper.ignoredDirs)
        .map(function (result) {
          return path.join(dir, result);

        });


      //Filter to retrieve files.
      return helper.getFiles(results).then(function (files) {


        //Filter directories
        var dirs = results.filter(function (res) {
          return files.indexOf(res) === -1;
        });

        if (dirs.length > 0) {

          return Q.all(dirs.map(readAllDirs))
            .then(helper.flatten)
            .then(function (moreFiles) {
              return moreFiles.concat(files);
            });
        } else {
          return files;
        }

      });
    });
  }

  function exec(argv, dir) {
    var pckgJsonPath = path.join(dir, 'package.json');

    helper.isFile(pckgJsonPath).then(function () {
        helper.readPckgJson(pckgJsonPath);

        readAllDirs(dir).then(function (files) {

          var jsFiles = files.filter(helper.isJavaScript);

          var next = helper.userAction(argv);
          helper.readAndExtract(jsFiles)
            .then(next);
        });


      })
      .then(null, function (error) {
        console.log(chalk.red(error));
      });

  }


  return {
    exec: exec
  };

}();
