'use strict';

var helper = require('./package-finder-helper');
var fs = require('fs');
module.exports = function () {
  function exec(argv, dir) {


    //read entire directory
    fs.readdir(dir, function (err, files) {
      if (err) {
        throw err;
      }

      var next = helper.userAction(argv);
      var jsFiles = files.filter(helper.isJavaScript);
      helper.readAndExtract(jsFiles, dir).then(next);
    });
  }


  return {
    exec: exec
  };

}();
