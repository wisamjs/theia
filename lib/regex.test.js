var expect = require('chai').expect;
var packageFinder = require('../index');
var globalRegex = require('./regex').getRegex();
var regex = new RegExp(globalRegex.source);
var _ = require('lodash');

describe('Regex', function () {
  it('should be accurate', function () {
    var regexTests = ["require(pack')",
      "require()",
      "('pack')",
      "require('pack'",
      "require(\"pack\')",
      "require('pack\")"
    ];
    _.forEach(regexTests, function (test) {
      expect(regex.test(test)).to.be.false;
    })
  });

  it('should handle commas and semicolons', function () {
    var regexTests = [
      "require('pack'),",
      "require('pack')",
      "require('pack');",
      ",require('pack')",
      ";require('pack')"
    ];
    _.forEach(regexTests, function (test) {
      expect(regex.test(test)).to.be.true;
    });
  });

  it('should handle certain symbols', function () {
    var regexTests = [
      "require ('pack'),",
      "require  (   'pack'  ) ;",
      "require('gulp-pack')",
      "require('gulp-pack-4')"
    ];
    _.forEach(regexTests, function (test) {
      expect(regex.test(test)).to.be.true;
    });
  });

  it('should handle single or double quotations', function () {
    var regexTests = [
      "require(\"pack\")",
      "require('pack')"
    ];
    _.forEach(regexTests, function (test) {
      expect(regex.test(test)).to.be.true;
    });
  });

  it('should not handle both single and double quotations', function () {
    var regexTests = [
      "require(\'pack\")",
      "require(\"pack')"
    ];
    _.forEach(regexTests, function (test) {
      expect(regex.test(test)).to.be.false;
    });
  });

  it('should handle global searches', function () {

    var regexTests =
      "require ('pack'), \
    require  (   'pack'  ) ;require('gulp-pack')\
    require('gulp-pack3')";

    expect(globalRegex.exec(regexTests)).to.be.an.instanceof(Array);
    expect(globalRegex.exec(regexTests)).to.be.an.instanceof(Array);
    expect(globalRegex.exec(regexTests)).to.be.an.instanceof(Array);
    expect(globalRegex.exec(regexTests)).to.be.an.instanceof(Array);
    expect(globalRegex.exec(regexTests)).to.be.a('null');
  });
});
