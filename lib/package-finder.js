'use strict';

var helper = require('./package-finder-helper');
var Q = require('q');
var chalk = require('chalk');
var path = require('path');

module.exports = function () {

  function readAllDirs(dir) {


    //read current directory
    return helper.readDir(dir).then(function (results) {

      //ignore node_modules folder if it exists
      results = results.filter(function (result) {
          return result !== 'node_modules' && result !== '.git';
        })
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

    try {
      helper.readPckgJson(path.join(dir, 'package'));

      readAllDirs(dir).then(function (files) {

        var jsFiles = files.filter(helper.isJavaScript);

        var next = helper.userAction(argv);
        helper.readAndExtract(jsFiles)
          .then(next);
      });
    } catch (e) {
      console.log(chalk.red(e));
    }
  }


  return {
    exec: exec
  };

}();
