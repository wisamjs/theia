var fs = require('fs');
var packageFile = require('../package');
var polyfill = require('./polyfills')();
var packageFinder = module.exports;
var requireRgx = require('./regex').getRegex();


//Get current dependencies from Package.json
var dependencies = packageFile.dependencies;
var devDependencies = packageFile.devDependencies;

var dir = './sampleProject/';


packageFinder.exec = function(){
  var data={};

//read entire directory
fs.readdir(dir,function(err,files){
    if (err){
      throw err
    };
    var jsFiles = files.filter(isJavaScript);


    jsFiles.forEach(function(jsFile){
        //read Js files
        fs.readFile(dir+jsFile,'utf-8',function(err,response){
            if (err){
              throw err;
            }

            var resp;
            var modules = [];

            while ((resp = requireRgx.exec(response)) !== null){
              modules.push(lastElement(resp));
            };

            console.log(modules);


        });
    });
});
}




function isJavaScript(file){
  return file.endsWith('.js');

};

function lastElement(arr){
  return arr[arr.length-1];
}






