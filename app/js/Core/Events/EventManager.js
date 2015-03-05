(function(){
  'use strict';
  var Utility = require('../../Namespaces/Utility.js');

  function EventManager(){
      this.registeredEventHandlers = [].repeat([],256);
      this.queuedEvents = new Utility.Queue(1024, null);

  }
  EventManager.prototype = {
     register : function(parent,handler,eventType){
          this.registeredEventHandlers[eventType].push(handler.bind(parent));
     },
     unregister : function(handler,eventType){
       var eventHandler = this.registeredEventHandlers[eventType];
       var index = eventHandler.indexOf(handler);
       this.registeredEventHandlers[eventType] = eventHandler.splice(index,1);
     },
     fireEvent : function(ev){
       var eventHandler = this.registeredEventHandlers[ev.EventType];
       for(var i =0;i<eventHandler.length;i++){
         eventHandler[i](ev);
       }
     },
     queueEvent : function(ev){
        this.queuedEvents.push(ev);
     },
     update : function(maxMillis){
       var startMillis = new Date().getTime();
       for(var i =0;i<this.queuedEvents.length();i++){
         var ev = this.queuedEvents.pop();
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
