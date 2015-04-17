/*eslint-disable no-extend-native*/
/*This is ok since its a polyfill.*/

'use strict';

module.exports = function () {
  // Polyfill for endsWith
  if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchString, position) {
      var subjectString = this.toString();
      if (position === undefined || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    };
  }

}();
