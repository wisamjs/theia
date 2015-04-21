'use strict';

var helper = require('./package-finder-helper');
var fs = require('fs');
var Q = require('q');
module.exports = function () {
  function exec(argv, dir) {


    //read entire directory
    fs.readdir(dir, function (err, results) {
      if (err) {
        throw err;
      }

      var next = helper.userAction(argv);

      Q.all(results.map(helper.isFile)).
      then(function (fileResults) {
        return results.filter(function (file, index) {
          return fileResults[index];
        });
      }).then(function (files) {
        var jsFiles = files.filter(helper.isJavaScript);
        helper.readAndExtract(jsFiles, dir).then(next);
      });


    });
  }


  return {
    exec: exec
  };

}();
