(function(){
  'use strict';
  require('../Namespaces/Utility.js');

  var LinkedList = function(size){
    this.array = [].repeat(0,size);
    this.count = 0;
    this.front = 0;
    this.back = 0;
    this.size = size;
  };

  LinkedList.prototype = {
    add : function(item){
      if(this.count >= this.size){
        throw 'LinkedList is full, size:' + this.size;
      }
      this.array[this.back] = item;
      this.back = (this.back + 1) % this.size;
    },
    remove : function(){
      if( this.front == this.back){
        return -1;
      }
      var result = this.array[this.front];
      this.array[this.front] = null;
      this.front = (this.front + 1) % this.size;
      return result;
    }
  };
 module.exports = LinkedList;
}());
