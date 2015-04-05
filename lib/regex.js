var requireRegex= module.exports;


requireRegex.getRegex = function(){
  return /((require)(\(')([a-z-0-9]*)'\))/g;
}
