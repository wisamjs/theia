var fs = require('fs');
var packageFile = require('../package');
var polyfill = require('./polyfills')();
var packageFinder = module.exports;
var regex = require('./regex').getRegex();


//Get current dependencies from Package.json
var dependencies = packageFile.dependencies;
var devDependencies = packageFile.devDependencies;

var dir = './sampleProject/';


packageFinder.exec = function () {
  var data = {};

  //read entire directory
  fs.readdir(dir, function (err, files) {
    if (err) {
      throw err
    };
    var jsFiles = files.filter(isJavaScript);


    jsFiles.forEach(function (jsFile) {
      //read Js files
      fs.readFile(dir + jsFile, 'utf-8', function (err, response) {
        if (err) {
          throw err;
        }

        var resp;
        var modules = [];

        //TODO: Remove while loop
        while ((resp = regex.exec(response)) !== null) {
          modules.push(npmName(resp));
        };

      });
    });
  });
}


function isJavaScript(file) {
  return file.endsWith('.js');

};

//TODO: a more efficient way of doing this
function npmName(arr) {
  return arr[7];
}
