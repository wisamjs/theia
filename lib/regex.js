'use strict';

module.exports = function () {
  function getRegex() {
    return /((require)( *)(\(( *)("|'))([a-z-A-Z-0-9]*)\6( *)\))/g;
  }

  return {
    getRegex: getRegex
  };

}();
