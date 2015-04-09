'use strict';

var regex = module.exports;
regex.getRegex = function () {
  return /((require)( *)(\(( *)("|'))([a-z-0-9]*)\6( *)\))/g;
};
