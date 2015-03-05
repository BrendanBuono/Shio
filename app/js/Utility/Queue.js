(function(){
  'use strict';
  require('../Namespaces/Utility.js');
  function Queue(size,initalValue){
    this.queue = [].repeat(initalValue,size);
    this.front = 0;
    this.back = 0;
    this.size = size;
  }
  Queue.prototype = {
    peek : function(){
      return this.queue[this.front];
    },
    length : function(){
      return Math.abs(this.back-this.front);
    },
    push : function(obj){
      if((this.front + 1) == this.back || (this.back+1) == this.front){
        console.log('Queue is full');
        return -1;
      }
      this.queue[this.back] = obj;
      this.back = (this.back + 1)% this.size;
    },
    pop : function(){
      if(this.front == this.back){
        return null;
      }
        var result = this.queue[this.front];
        this.front = (this.front + 1) % this.size;
        return result;
    }
  };
  module.exports = Queue;
}());
