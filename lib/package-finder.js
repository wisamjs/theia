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



    //read current directory
    return readDir(dir).then(function (results) {

      //add dir to files
      results = results.map(function(result){
        return dir+result;

      });


      //Filter to retrieve files.
      return getFiles(results).then(function (files) {
        //TODO: Ensure all directories have been read.

        //Fiilter directories
        var dirs = results.filter(function(res){
          return files.indexOf(res) === -1;
        })

        // add '/' to directory name
        dirs = dirs.map(function(directory){
          return directory+'/';
        })

        if (dirs.length > 0){
          //TODO: map through all directories
          return readAllDirs(dirs[0]).then(function(otherFiles){
            return files.concat(otherFiles);
          });
        }else{
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
