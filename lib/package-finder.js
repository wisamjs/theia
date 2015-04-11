'use strict';

var packageFinder = module.exports;
var helper = require('./package-finder-helper');
var fs = require('fs');

packageFinder.exec = function (argv, dir) {


  //read entire directory
  fs.readdir(dir, function (err, files) {
    if (err) {
      throw err;
    }

    var next = helper.userAction(argv);
    var jsFiles = files.filter(helper.isJavaScript);
    helper.readAndExtract(jsFiles, dir).then(function (pckgs) {
      return next(pckgs);
    });
  });
};
