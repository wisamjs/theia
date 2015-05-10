'use strict';

module.exports = function () {
  function getRegex() {
    return /require\s*\(\s*(['"])([\w-.]+)\1\s*\)/g;
  }

  return {
    getRegex: getRegex
  };

}();
