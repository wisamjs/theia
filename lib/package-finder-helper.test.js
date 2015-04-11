/*eslint-disable no-unused-expressions*/
'use strict';

var expect = require('chai').expect;
var helper = require('./package-finder-helper');
describe('Helper object', function () {

  it('should exist', function () {
    expect(helper).to.be.an('object');
  });
});

describe('helper.isJavaScript', function () {
  it('should use polyfill properly', function () {
    expect(helper.isJavaScript('test.js')).to.be.true;
    expect(helper.isJavaScript('test.html')).to.be.false;
  });
});

describe('helper.filterPackageName', function () {
  var test = 'require(\'gulp-sass\')';
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

describe('helper.isObjProp', function () {
  var obj = {
    'bower': 'v1',
    'express': 'v2'
  };
  var prop = 'bower';
  var notProp = 'mongoose';
  it('should correctly identify Object properties', function () {
    expect(helper.isObjProp(obj, prop)).to.be.true;
    expect(helper.isObjProp(obj, notProp)).to.be.false;
  });
});

describe('helper.isNotObjProp', function () {
  it('should return a function', function () {
    expect(helper.isNotObjProp({})).to.be.a('function');
  });

  it('should be a curried function', function () {
    var deps = {
      bower: true,
      gulp: true
    };
    var curry = helper.isNotObjProp(deps);
    expect(curry).to.be.a('function');
    expect(curry('bower')).to.be.false;
    expect(curry('mongoose')).to.be.true;

  });

});

describe('helper.readAndExtract', function () {
  var data = ['./sampleProject/app.js'];
  it('should return a promise', function () {
    expect(helper.readAndExtract(data).then).to.be.a('function');
  });
});

describe('helper.readAndExtract', function () {
  var data = ['./sampleProject/app.js'];
  it('should return a promise', function () {
    expect(helper.readAndExtract(data).then).to.be.a('function');
  });
});

describe('helper.makeCheckboxObject', function () {
  it('should return an object with properties', function () {
    expect(helper.makeCheckboxObject('Tom')).to.be.an('object');
    expect(helper.makeCheckboxObject('Tom')).to.have.property('name');
    expect(helper.makeCheckboxObject('Tom')).to.have.property('checked');
  });

  it('should have the right property values', function () {
    expect(helper.makeCheckboxObject('Tom').name).to.deep.equal('Tom');
    expect(helper.makeCheckboxObject('Tom').checked).to.deep.equal(
      false);
  });
});

describe('helper.displayMissing', function () {
  it('should exist', function () {
    expect(helper.displayMissing).to.be.a('function');
  });
});

describe('helper.installDeps', function () {
  it('should exist', function () {
    expect(helper.installDeps).to.be.a('function');
  });
});

describe('helper.confirmInstall', function () {
  it('should exist', function () {
    expect(helper.confirmInstall).to.be.a('function');
  });
});

describe('helper.userAction', function () {
  it('should be a curried function', function () {
    expect(helper.userAction({})).to.be.a('function');
  });
});
