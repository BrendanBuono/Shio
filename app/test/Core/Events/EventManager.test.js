(function() {
 'use strict';
 var EventManager = require('../../../js/Core/Events/EventManager.js');
 describe('EventManager', function() {
  var eventManager = new EventManager();
  beforeEach(function() {
   eventManager = new EventManager();
  });
  describe('register', function() {
   var parent = {};
   var handler = function() {};
   var eventType = 0;
   beforeEach(function() {
    spyOn(handler, 'bind');

   });
   it('registers to correct event type', function() {
    eventManager.register(parent, handler, eventType);
    expect(eventManager.registeredEventHandlers[eventType].length).toBe(1);
   });
   it('registers the correct handler', function() {
    eventManager.register(parent, handler, eventType);
    expect(eventManager.registeredEventHandlers[eventType][0]).toBe(handler);
   });
   it('binds event handler to it\'s parent', function() {
    eventManager.register(parent, handler, eventType);
    expect(handler.bind).toHaveBeenCalledWith(parent);
   });
  });
  describe('unregister', function() {
   var mockRegisteredEventHandlers;
   var eventType = 0;
   var handlers = [1, 2, 3, 4];
   beforeEach(function() {
    eventManager = new EventManager();
    mockRegisteredEventHandlers = [];
    mockRegisteredEventHandlers[eventType] = handlers;
    eventManager.registeredEventHandlers = mockRegisteredEventHandlers;

   });
   it('unregisters handler', function() {
    eventManager.unregister(2, eventType);
    expect(eventManager.registeredEventHandlers[eventType]).toEqual([1, 3, 4]);
   });
  });
  describe('queueEvent', function() {
   beforeEach(function() {

   });
   it('queues single event', function() {
    eventManager.queueEvent(1);
    expect(eventManager.queuedEvents.peek()).toBe(1);
   });
   it('queues multiple events', function() {
    for (var i = 0; i < 5; i++) {
     eventManager.queueEvent(i);
    }
    for (var j = 0; j < 5; j++) {
     expect(eventManager.queuedEvents.dequeue()).toBe(j);
    }
   });
  });
  describe('fireEvent', function() {
   var eventHandler;
   var event = {
    EventType: 0
   };
   beforeEach(function() {
    eventHandler = jasmine.createSpy();
    eventManager.registeredEventHandlers[event.EventType].push(eventHandler);
   });
   it('Calls the event handlers for the fired event', function() {
    eventManager.fireEvent(event);
    expect(eventHandler).toHaveBeenCalledWith(event);
   });
  });
 });
})();
