/*eslint-disable no-unused-expressions*/
'use strict';

var expect = require('chai').expect;
var polyfill = require('../lib/polyfills');

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
