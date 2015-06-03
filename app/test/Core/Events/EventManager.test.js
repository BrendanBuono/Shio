(function(){
  'use strict';
  var EventManager = require('../../../js/Core/Events/EventManager.js');
  describe('EventManager', function(){
    var eventManager = new EventManager();
    beforeEach(function(){
      eventManager = new EventManager();
    });
    describe('register',function(){
      var parent = {};
      var handler = function(){};
      var eventType = 0;
      beforeEach(function(){
        spyOn(handler,'bind');

      });
        it('registers to correct event type',function(){
          eventManager.register(parent,handler,eventType);
          expect(eventManager.registeredEventHandlers[eventType].length).toBe(1);
        });
        it('registers the correct handler',function(){
          eventManager.register(parent,handler,eventType);
          expect(eventManager.registeredEventHandlers[eventType][0]).toBe(handler);
        });
        it('binds event handler to it\'s parent',function(){
          eventManager.register(parent,handler,eventType);
          expect(handler.bind).toHaveBeenCalledWith(parent);
        });
    });
  });
})();
