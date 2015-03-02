Array.prototype.repeat = function(what, l){
  while(l){
    this[--l] = what;
  }
  return this;
};
