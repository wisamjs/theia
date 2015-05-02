/*eslint-disable no-unused-expressions*/
'use strict';

var expect = require('chai').expect;
var rewire = require('rewire');
var helper = rewire('../lib/theia-helper');
var isObjProp;
var isNotObjProp;
var replaceWithName;
var makeCheckboxObject;
var displayMissing;
var install;
var confirmInstall;
var nonIntersect;
var prompt;
var installablePckg;
var makeUnique;
var mockInquirer = {
  prompt: function (arr, callback) {
    return callback({
      selected: ['gulp']
    });
  }
};

beforeEach(function () {
  isObjProp = helper.__get__('isObjProp');
  isNotObjProp = helper.__get__('isNotObjProp');
  replaceWithName = helper.__get__('replaceWithName');
  makeCheckboxObject = helper.__get__('makeCheckboxObject');
  displayMissing = helper.__get__('displayMissing');
  install = helper.__get__('install');
  confirmInstall = helper.__get__('install');
  nonIntersect = helper.__get__('nonIntersect');
  prompt = helper.__get__('prompt');
  installablePckg = helper.__get__('installablePckg');
  makeUnique = helper.__get__('makeUnique');
  helper.__set__('inquirer', mockInquirer);
});

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

describe('helper.userAction', function () {
  it('should be a partial function', function () {
    expect(helper.userAction({})).to.be.a('function');
  });
});

describe('helper.readAndExtract', function () {
  var data = ['./sampleProject/app.js'];
  it('should return a promise', function () {
    expect(helper.readAndExtract(data).then).to.be.a('function');
  });
});

describe('replaceWithName', function () {

  var test = 'require(\'gulp-sass\')';
  it('should return package name', function () {
    expect(replaceWithName(test)).to.deep.equal('gulp-sass');
  });
});

describe('flatten', function () {
  var arr = [
    ['gulp-sass', 'gulp-filter', 'express'],
    ['body-parser', 'brocoli'],
    ['grunt']
  ];

  it('should work and return an array', function () {
    expect(helper.flatten(arr)).to.have.length(6);
    expect(helper.flatten(arr)).to.be.an.instanceof(Array);
    expect(helper.flatten(arr)[0]).to.deep.equal('gulp-sass');
  });
});

describe('isObjProp', function () {
  var obj = {
    'bower': 'v1',
    'express': 'v2'
  };
  var prop = 'bower';
  var notProp = 'mongoose';
  it('should correctly identify Object properties', function () {
    expect(isObjProp(obj, prop)).to.be.true;
    expect(isObjProp(obj, notProp)).to.be.false;
  });
});

describe('isNotObjProp', function () {
  it('should return a function', function () {
    expect(isNotObjProp({})).to.be.a('function');
  });

  it('should be a partial function', function () {
    var deps = {
      bower: true,
      gulp: true
    };
    var partial = isNotObjProp(deps);
    expect(partial).to.be.a('function');
    expect(partial('bower')).to.be.false;
    expect(partial('mongoose')).to.be.true;

  });

});

describe('installablePckg', function () {
  it('should return true if package is installable', function () {
    expect(installablePckg('gulp')).to.be.true;
  });
  it('should return false if package is a built-in node package', function () {
    expect(installablePckg('fs')).to.be.false;
  });
});

describe('makeCheckboxObject', function () {
  it('should return an object with properties', function () {
    expect(makeCheckboxObject('Tom')).to.be.an('object');
    expect(makeCheckboxObject('Tom')).to.have.property('name');
    expect(makeCheckboxObject('Tom')).to.have.property('checked');
  });

  it('should have the right property values', function () {
    expect(makeCheckboxObject('Tom').name).to.deep.equal('Tom');
    expect(makeCheckboxObject('Tom').checked).to.deep.equal(
      false);
  });
});

describe('makeUnique', function () {

  it('should remove duplicates', function () {
    expect(makeUnique([1, 2, 1, 3, 4, 2])).to.deep.equal([1, 2, 3, 4]);

  });

});

describe('displayMissing', function () {
  it('should exist', function () {
    expect(displayMissing).to.be.a('function');
  });
});

describe('install', function () {
  it('should exist', function () {
    expect(install).to.be.a('function');
  });
});

describe('confirmInstall', function () {
  it('should exist', function () {
    expect(confirmInstall).to.be.a('function');
  });
});

describe('nonIntersect', function () {
  it('should return a function', function () {
    expect(nonIntersect([1, 2, 3])).to.be.a('function');
  });

  it('should return correct values', function () {
    var missing = nonIntersect(['gulp', 'gulp-sass']);
    expect(missing('gulp')).to.be.false;
    expect(missing('bower')).to.be.true;

  });
});

describe('prompt', function () {
  it('should take two arguements and return a promise', function () {
    var mockPrompt = prompt('save', ['gulp']);
    mockPrompt.then(function (val) {
      expect(val).to.be.truthy;
    });
  });
});
