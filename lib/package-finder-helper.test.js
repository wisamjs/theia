var expect = require('chai').expect;
var _ = require('lodash');
var helper = require('./package-finder-helper');
describe('Helper object', function () {

  it('should exist', function () {
    expect(helper).to.be.an('object');
  })
});

describe('helper.isJavaScript', function () {
  it('should use polyfill properly', function () {
    expect(helper.isJavaScript('test.js')).to.be.true;
    expect(helper.isJavaScript('test.html')).to.be.false;
  });
});

describe('helper.filterPackageName', function () {
  var test = "require('gulp-sass')";
  it('should return package name', function () {
    expect(helper.filterPackageName(test)).to.deep.equal('gulp-sass');
  });
});

describe('helper.combinePackages', function () {
  var arr = [
    ['gulp-sass', 'gulp-filter', 'express'],
    ['body-parser', 'brocoli'],
    ['grunt']
  ];

  it('should work and return an array', function () {
    expect(helper.combinePackages(arr)).to.have.length(6);
    expect(helper.combinePackages(arr)).to.be.an.instanceof(Array);
    expect(helper.combinePackages(arr)[0]).to.deep.equal('gulp-sass');
  });
});

describe('helper.isObjectProperty', function () {
  var obj = {
    'bower': 'v1',
    'express': 'v2'
  };
  var prop = 'bower';
  var notProp = 'mongoose';
  it('should correctly identify Object properties', function () {
    expect(helper.isObjectProperty(obj, prop)).to.be.true;
    expect(helper.isObjectProperty(obj, notProp)).to.be.false;
  });
});

describe('helper.readAndExtract', function () {
  var data = ['./sampleProject/app.js'];
  it('should return a promise', function () {
    expect(helper.readAndExtract(data).then).to.be.a('function');
  })
});
