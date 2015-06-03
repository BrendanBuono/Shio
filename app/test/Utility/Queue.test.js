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
      it('looks at the top of the queue',function(){
        for(var i = 0;i<10;i++){
          queue.list.push(i);
        }
        var result = queue.peek();
        expect(result).toBe(9);
      });
    });
  });

})();
