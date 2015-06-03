(function(){
  'use strict';
  var Queue = require('../../js/Utility/Queue.js');
  describe('Queue',function(){
    var queue = new Queue();
    beforeEach(function(){
      queue = new Queue();
    });
    describe('enqueue',function(){
      it('adds items to the queue',function(){
        queue.enqueue(1);
        expect(queue.list[0]).toBe(1);
      });
    });

    describe('dequeue',function(){
      it('removes items from queue',function(){
        queue.list.push(1);
        var result = queue.dequeue();
        expect(result).toBe(1);
      });
    });

    describe('peek',function(){
      beforeEach(function(){
        for(var i = 0;i<10;i++){
          queue.list.push(i);
        }
      });
      it('looks at the top of the queue',function(){

        var result = queue.peek();
        expect(result).toBe(9);
      });
      it('does not remove item from queue',function(){
          var beforeSize = queue.list.length;
          queue.peek();
          var afterSize = queue.list.length;
          expect(beforeSize === afterSize).toBe(true);
      });
    });
    describe('size',function(){
      it('returns the correct size of the queue',function(){
        for(var i=0;i<10;i++){
          queue.enqueue(i);
        }
        expect(queue.size()).toBe(10);
      });
    });
  });

})();
