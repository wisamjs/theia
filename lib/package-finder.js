'use strict';

var helper = require('./package-finder-helper');
var fs = require('fs');
var Q = require('q');
module.exports = function () {

  function readDir(dir) {
    return Q.nfcall(fs.readdir, dir);
  }

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
    return readDir(dir).then(function (results) {

      return getFiles(results).then(function (files) {
        //TODO: Ensure all directories have been read.
        return files.filter(helper.isJavaScript);

      });
    });
  }

  function exec(argv, dir) {
    readAllDirs(dir).then(function (jsFiles) {
      var next = helper.userAction(argv);
      helper.readAndExtract(jsFiles, dir).then(next);
    });
  }


  return {
    exec: exec
  };

}();
