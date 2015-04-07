var packageFinder = module.exports;
var helper = require('./package-finder-helper');
var fs = require('fs');

packageFinder.exec = function (dir) {
  var data = {};

  //read entire directory
  fs.readdir(dir, function (err, files) {
    if (err) {
      throw err
    };
    var jsFiles = files.filter(helper.isJavaScript);
    helper.readAndExtract(jsFiles, dir).then(helper.promptUser);
  });
}
