'use strict';

module.exports = function () {
  function getRegex() {
    return /((require)( *)(\(( *)("|'))([a-z-0-9]*)\6( *)\))/g;
  }

  return {
    getRegex: getRegex
  };

}();
