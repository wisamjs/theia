'use strict';

var helper = require('./package-finder-helper');
var Q = require('q');
module.exports = function () {


  //Returns an array of file names
  function getFiles(results) {
    return Q.all(results.map(helper.isFile)).
    then(function (fileResults) {
      return results.filter(function (file, index) {
        return fileResults[index];
      });
    });

  }

  function readAllDirs(dir) {


    //read current directory
    return helper.readDir(dir).then(function (results) {

      //ignore node_modules folder if it exists
      results = results.filter(function (result) {
          return result !== 'node_modules';
        })
        .map(function (result) {
          return dir + result;

        });


      //Filter to retrieve files.
      return getFiles(results).then(function (files) {

        //Filter directories
        var dirs = results.filter(function (res) {
          return files.indexOf(res) === -1;
        });

        if (dirs.length > 0) {

          // add '/' to directory name
          dirs = dirs.map(function (directory) {
            return directory + '/';
          });


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
    readAllDirs(dir).then(function (files) {
      var jsFiles = files.filter(helper.isJavaScript);
      var next = helper.userAction(argv);
      helper.readAndExtract(jsFiles).then(next);
    });
  }


  return {
    exec: exec
  };

}();
