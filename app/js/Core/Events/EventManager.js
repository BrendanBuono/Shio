(function(){
  'use strict';
  var Utility = require('../../Namespaces/Utility.js');

  function EventManager(){
      this.registeredEventHandlers = [];
      for(var i = 0;i<256;i++){
        this.registeredEventHandlers[i] = [];
      }
      this.queuedEvents = new Utility.Queue();

  }
  EventManager.prototype = {
     register : function(parent,handler,eventType){
       handler.bind(parent);
          this.registeredEventHandlers[eventType].push(handler);
     },
     unregister : function(handler,eventType){
       var eventHandler = this.registeredEventHandlers[eventType];
       var index = eventHandler.indexOf(handler);
       eventHandler.splice(index,1);
     },
     fireEvent : function(ev){
       var eventHandler = this.registeredEventHandlers[ev.EventType];
       for(var i =0;i<eventHandler.length;i++){
         eventHandler[i](ev);
       }
     },
     queueEvent : function(ev){
        this.queuedEvents.enqueue(ev);
     },
     update : function(maxMillis){
       var startMillis = new Date().getTime();
       for(var i =0;i<this.queuedEvents.size();i++){
         var ev = this.queuedEvents.dequeue();
         this.fireEvent(ev);
         if(this._exceededTime(startMillis,maxMillis)){
           break;
         }
       }
     },
     _exceededTime : function(startMillis, maxMillis){
       var curMillis = new Date().getTime();
       var elapsedMillis = curMillis - startMillis;
       if(elapsedMillis > maxMillis){
         return true;
       }
       return false;
     }
  };

  module.exports = EventManager;
}());
