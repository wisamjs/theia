/*eslint-disable no-unused-expressions*/
'use strict';

var expect = require('chai').expect;
var globalRegex = require('../lib/regex').getRegex();
var regex = new RegExp(globalRegex.source);
var _ = require('lodash');

describe('Regex', function () {
  it('should be accurate', function () {
    var regexTests = ['require(pack\')',
      'require()',
      '(\'pack\')',
      'require(\'pack\'',
      'require(\"pack\')',
      'require(\'pack\")'
    ];
    _.forEach(regexTests, function (test) {
      expect(regex.test(test)).to.be.false;
    });
  });

  it('should handle commas and semicolons and dots', function () {
    var regexTests = [
      'require(\'pack\'),',
      'require(\'pack\')',
      'require(\'pack\');',
      ',require(\'pack\')',
      ';require(\'pack\')',
      'require(\'gulp.pack\')'
    ];
    _.forEach(regexTests, function (test) {
      expect(regex.test(test)).to.be.true;
    });
  });

  it('should handle spaces', function () {
    var regexTests = [
      'require (\'pack\'),',
      'require  (   \'pack\'  ) ;',
      'require(\'gulp-pack\')',
      'require(\'gulp-pack-4\')'
    ];
    _.forEach(regexTests, function (test) {
      expect(regex.test(test)).to.be.true;
    });
  });

  it('should handle uppercase and lowercase letters', function () {
    var regexTests = ['require(\'TEST\')', 'require(\'gulp\')',
      'require(\'gUlP\')'
    ];

    _.forEach(regexTests, function (test) {
      expect(regex.test(test)).to.be.true;
    });
  });

  it('should handle single or double quotations', function () {
    var regexTests = [
      'require(\"pack\")',
      'require(\'pack\')'
    ];
    _.forEach(regexTests, function (test) {
      expect(regex.test(test)).to.be.true;
    });
  });

  it('should not handle both single and double quotations', function () {
    var regexTests = [
      'require(\'pack\")',
      'require(\"pack\')'
    ];
    _.forEach(regexTests, function (test) {
      expect(regex.test(test)).to.be.false;
    });
  });

  it('should handle global searches', function () {

    var regexTests =
      'require (\'pack\'),' +
      'require  (   \'pack\'  );' +
      'require(\'gulp-pack\')' +
      'require(\'gulp-pack3\');' +
      //below 2 should not match
      'require(\'pack\"),' +
      'require(\"pack\')';

    expect(regexTests.match(globalRegex)).to.be.an.instanceof(Array);
    expect(regexTests.match(globalRegex).length).to.equal(4);
  });
});
