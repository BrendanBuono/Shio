var Utility =  Utility || {};
Utility.GuidGenerator = require('../Utility/UUIDjs.js');
Array.prototype.repeat = function(what, l){
  while(l){
    this[--l] = what;
  }
  return this;
};

module.exports = Utility;
