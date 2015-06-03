(function(){
  'use strict';
  function Queue(){
    this.list = [];
  }
  Queue.prototype = {
    enqueue : function(obj){
      this.list.push(obj);
    },
    dequeue : function(){
      if(this.list.length === 0){
        throw new RangeError('Queue is empty');
      }
      var result = this.list.shift();
      return result;
    },
    peek : function(){
      return this.list[this.list.length - 1];
    },
    size : function(){
      return this.list.length;
    }
  };
  module.exports = Queue;
})();
