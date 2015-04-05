var expect = require('chai').expect;
var packageFinder = require('../index');
var fs = require('fs');
var polyfill = require('./polyfills')();
var regex = require('./regex').getRegex();
var _ = require('lodash');

describe('String.endsWith polyfill', function () {
  var file1 = 'file.js';
  var file2 = 'file.html';

  it('should work', function () {
    expect(file1.endsWith('.js')).to.be.true;
    expect(file1.endsWith('.html')).to.be.false;
    expect(file2.endsWith('.html')).to.be.true;
    expect(file2.endsWith('.js')).to.be.false;

  });

});

describe('Regex', function () {
  it('should be accurate', function () {
    var regexTests =
      ["require(pack')",
       "require()",
       "('pack')",
       "require('pack'",
        "require(\"pack\')",
        "require('pack\")"
      ];
    _.forEach(regexTests,function(test){
      expect(regex.exec(test)).to.be.a('null');
    })
  });

  it('should handle commas and semicolons', function () {
    var regexTests =
      ["require('test')",
       "require('test'),",
       "require('test');",
       ",require('test')",
       ";require('test')"
      ];
    _.forEach(regexTests,function(test){
    expect(regex.exec(test)).to.be.instanceof(Array);
    });
  });
});

